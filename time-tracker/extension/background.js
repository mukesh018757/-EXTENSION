console.log('Background service worker started');

let activeTabId = null;
let activeTabDomain = '';
let startTime = Date.now();
let isPaused = false;
let todayData = {};
let lastSavedAt = Date.now();
let lastSyncedAt = Date.now();
let idleDetectionEnabled = true;
let idleTimeoutMinutes = 10;
let notificationSettings = {
  unproductiveThreshold: 30,
  dailySummaryTime: '21:00'
};

function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${secs}s`;
}

function getDomainFromUrl(url) {
  if (!url) return 'unknown';
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch (error) {
    return 'unknown';
  }
}

function classifyDomain(domain) {
  const productive = ['github.com', 'stackoverflow.com', 'leetcode.com', 'codecademy.com', 'coursera.org', 'udemy.com', 'docs.google.com', 'notion.so', 'linkedin.com', 'geeksforgeeks.org', 'hackerrank.com', 'kaggle.com'];
  const unproductive = ['youtube.com', 'instagram.com', 'facebook.com', 'twitter.com', 'reddit.com', 'netflix.com', 'tiktok.com', 'snapchat.com', 'whatsapp.web.com', 'twitch.tv', 'pinterest.com', 'tumblr.com'];

  const normalized = domain.toLowerCase();

  if (productive.some(item => normalized === item || normalized.endsWith('.' + item))) return 'productive';
  if (unproductive.some(item => normalized === item || normalized.endsWith('.' + item))) return 'unproductive';
  return 'neutral';
}

function flushCurrentTabTime() {
  if (!activeTabDomain || isPaused) return;

  const elapsed = (Date.now() - startTime) / 1000;
  if (elapsed > 0) {
    todayData[activeTabDomain] = (todayData[activeTabDomain] || 0) + elapsed;
    console.log(`Tracked ${formatTime(Math.round(elapsed))} for ${activeTabDomain}`);
  }
  startTime = Date.now();
}

function saveDataToStorage() {
  chrome.storage.local.set({ todayData, lastSavedAt: Date.now() }, () => {
    console.log('Saved data to chrome.storage.local');
  });
}

function sendDataToServer() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['authToken', 'todayData'], async (result) => {
      try {
        const token = result.authToken;
        if (!token || !result.todayData || Object.keys(result.todayData).length === 0) {
          resolve(false);
          return;
        }

        const today = new Date().toISOString().slice(0, 10);
        const logs = Object.entries(result.todayData).map(([domain, seconds]) => ({
          domain,
          category: classifyDomain(domain),
          seconds: Math.round(seconds),
          date: today
        }));

        const response = await fetch('http://localhost:5000/api/timelog/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ logs })
        });

        if (response.ok) {
          console.log('Data synced to backend');
          chrome.storage.local.set({ todayData: {}, lastSyncedAt: Date.now() }, () => {
            todayData = {};
            resolve(true);
          });
        } else {
          console.log('Backend sync failed');
          resolve(false);
        }
      } catch (error) {
        console.error('Sync error:', error.message);
        resolve(false);
      }
    });
  });
}

function updateTrackingForTab(tabId, url) {
  if (!tabId) return;

  const domain = getDomainFromUrl(url);
  if (activeTabDomain && activeTabDomain !== domain) {
    flushCurrentTabTime();
  }

  activeTabId = tabId;
  activeTabDomain = domain;
  startTime = Date.now();
  console.log(`Tracking started for ${domain}`);
}

function restoreState() {
  chrome.storage.local.get(['todayData', 'authToken', 'isPaused', 'idleDetectionEnabled', 'idleTimeoutMinutes', 'notificationSettings'], (result) => {
    todayData = result.todayData || {};
    isPaused = Boolean(result.isPaused);
    idleDetectionEnabled = result.idleDetectionEnabled !== false;
    idleTimeoutMinutes = result.idleTimeoutMinutes || 10;
    notificationSettings = result.notificationSettings || notificationSettings;
    console.log('State restored from storage');
  });
}

function maybeNotifyUnproductive(domain) {
  if (classifyDomain(domain) !== 'unproductive') return;
  const key = `unproductive_${domain}`;
  chrome.storage.local.get([key], (result) => {
    const current = result[key] || 0;
    const threshold = notificationSettings.unproductiveThreshold || 30;
    if (current + 1 >= threshold) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Focus warning',
        message: `You have spent ${threshold} minutes on ${domain}. Consider taking a break.`
      });
    }
    chrome.storage.local.set({ [key]: current + 1 });
  });
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError) return;
    updateTrackingForTab(tab.id, tab.url);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) {
    updateTrackingForTab(tabId, changeInfo.url);
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    flushCurrentTabTime();
  } else {
    chrome.windows.get(windowId, { populate: true }, (window) => {
      if (window && window.tabs) {
        const activeTab = window.tabs.find(tab => tab.active);
        if (activeTab) {
          updateTrackingForTab(activeTab.id, activeTab.url);
        }
      }
    });
  }
});

chrome.idle.onStateChanged.addListener((state) => {
  if (!idleDetectionEnabled) return;
  if (state === 'idle') {
    flushCurrentTabTime();
    console.log('User idle, tracking paused');
  } else if (state === 'active') {
    startTime = Date.now();
    console.log('User active again');
  }
});

chrome.alarms.create('saveData', { periodInMinutes: 0.5 });
chrome.alarms.create('syncData', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'saveData') {
    flushCurrentTabTime();
    saveDataToStorage();
  }

  if (alarm.name === 'syncData') {
    flushCurrentTabTime();
    sendDataToServer();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'pauseTracking') {
    isPaused = message.value;
    chrome.storage.local.set({ isPaused });
    console.log(`Tracking ${isPaused ? 'paused' : 'resumed'}`);
    sendResponse({ success: true });
  }

  if (message.type === 'getTodayData') {
    chrome.storage.local.get(['todayData'], (result) => {
      sendResponse({ data: result.todayData || {} });
    });
    return true;
  }

  if (message.type === 'trackVisit') {
    const domain = getDomainFromUrl(message.url);
    maybeNotifyUnproductive(domain);
    sendResponse({ success: true });
  }

  return true;
});

restoreState();
setInterval(() => {
  if (!isPaused) {
    flushCurrentTabTime();
    saveDataToStorage();
  }
}, 30000);

setInterval(() => {
  if (!isPaused) {
    sendDataToServer();
  }
}, 300000);
