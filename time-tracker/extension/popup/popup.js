// Format seconds into a readable time string.
function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${secs}s`;
}

// Pick a color for the website category.
function getCategoryColor(category) {
  if (category === 'productive') return '#22c55e';
  if (category === 'unproductive') return '#ef4444';
  return '#64748b';
}

// Load the tracking details and render the popup summary.
async function loadPopupData() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'getTodayData' });
    const data = response?.data || {};
    const entries = Object.entries(data).map(([domain, seconds]) => ({ domain, seconds: Math.round(seconds) }));
    entries.sort((a, b) => b.seconds - a.seconds);

    const total = entries.reduce((sum, item) => sum + item.seconds, 0);
    const productive = entries.filter(item => item.domain.includes('github') || item.domain.includes('leetcode') || item.domain.includes('coursera') || item.domain.includes('notion') || item.domain.includes('stackoverflow') || item.domain.includes('kaggle') || item.domain.includes('hackerrank')).reduce((sum, item) => sum + item.seconds, 0);
    const unproductive = entries.filter(item => item.domain.includes('youtube') || item.domain.includes('instagram') || item.domain.includes('facebook') || item.domain.includes('reddit') || item.domain.includes('netflix') || item.domain.includes('tiktok') || item.domain.includes('twitter')).reduce((sum, item) => sum + item.seconds, 0);

    document.getElementById('totalTime').textContent = formatTime(total);
    document.getElementById('productiveTime').textContent = formatTime(productive);
    document.getElementById('unproductiveTime').textContent = formatTime(unproductive);

    const productivePercent = total ? Math.round((productive / total) * 100) : 0;
    const unproductivePercent = total ? Math.round((unproductive / total) * 100) : 0;
    document.getElementById('productivePercent').textContent = `${productivePercent}%`;
    document.getElementById('unproductivePercent').textContent = `${unproductivePercent}%`;

    const topSitesContainer = document.getElementById('topSites');
    topSitesContainer.innerHTML = '';

    entries.slice(0, 5).forEach((item) => {
      const row = document.createElement('div');
      row.className = 'site-item';
      row.innerHTML = `
        <div>
          <div>${item.domain}</div>
          <div class="bar"><div style="width:${Math.min(100, (item.seconds / Math.max(total, 1)) * 100)}%; background:${getCategoryColor('neutral')};"></div></div>
        </div>
        <strong>${formatTime(item.seconds)}</strong>
      `;
      topSitesContainer.appendChild(row);
    });

    const currentSite = document.getElementById('currentSite');
    const currentSiteTime = document.getElementById('currentSiteTime');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      const domain = new URL(activeTab.url).hostname.replace('www.', '');
      currentSite.textContent = domain;
      currentSiteTime.textContent = formatTime(Math.round(data[domain] || 0));
    });
  } catch (error) {
    console.error('Popup load error:', error.message);
  }
}

document.getElementById('togglePause').addEventListener('click', async () => {
  const current = await chrome.storage.local.get(['isPaused']);
  const response = await chrome.runtime.sendMessage({ type: 'pauseTracking', value: !current.isPaused });
  console.log('Pause toggled', response);
});

document.getElementById('openDashboard').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
});

loadPopupData();
