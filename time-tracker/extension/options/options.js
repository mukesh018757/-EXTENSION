// Initialize the settings page once the DOM is ready.
document.addEventListener('DOMContentLoaded', () => {
  const productiveInput = document.getElementById('productiveInput');
  const unproductiveInput = document.getElementById('unproductiveInput');
  const goalInput = document.getElementById('goalInput');
  const idleEnabled = document.getElementById('idleEnabled');
  const idleTimeout = document.getElementById('idleTimeout');
  const unproductiveThreshold = document.getElementById('unproductiveThreshold');
  const dailySummaryTime = document.getElementById('dailySummaryTime');

  function renderList(list, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    list.forEach((item) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = item;
      container.appendChild(chip);
    });
  }

  chrome.storage.sync.get(['productiveSites', 'unproductiveSites', 'dailyGoal', 'idleDetectionEnabled', 'idleTimeoutMinutes', 'notificationSettings'], (result) => {
    const productiveSites = result.productiveSites || [];
    const unproductiveSites = result.unproductiveSites || [];
    renderList(productiveSites, 'productiveList');
    renderList(unproductiveSites, 'unproductiveList');
    goalInput.value = result.dailyGoal || 4;
    idleEnabled.checked = result.idleDetectionEnabled !== false;
    idleTimeout.value = result.idleTimeoutMinutes || 10;
    unproductiveThreshold.value = (result.notificationSettings && result.notificationSettings.unproductiveThreshold) || 30;
    dailySummaryTime.value = (result.notificationSettings && result.notificationSettings.dailySummaryTime) || '21:00';
  });

  document.getElementById('addProductive').addEventListener('click', () => {
    const value = productiveInput.value.trim();
    if (!value) return;
    chrome.storage.sync.get(['productiveSites'], (result) => {
      const list = result.productiveSites || [];
      if (!list.includes(value)) list.push(value);
      chrome.storage.sync.set({ productiveSites: list }, () => renderList(list, 'productiveList'));
    });
  });

  document.getElementById('addUnproductive').addEventListener('click', () => {
    const value = unproductiveInput.value.trim();
    if (!value) return;
    chrome.storage.sync.get(['unproductiveSites'], (result) => {
      const list = result.unproductiveSites || [];
      if (!list.includes(value)) list.push(value);
      chrome.storage.sync.set({ unproductiveSites: list }, () => renderList(list, 'unproductiveList'));
    });
  });

  document.getElementById('saveGoal').addEventListener('click', () => {
    chrome.storage.sync.set({ dailyGoal: Number(goalInput.value) || 4 });
  });

  document.getElementById('saveIdle').addEventListener('click', () => {
    chrome.storage.sync.set({
      idleDetectionEnabled: idleEnabled.checked,
      idleTimeoutMinutes: Number(idleTimeout.value) || 10
    });
  });

  document.getElementById('saveNotifications').addEventListener('click', () => {
    chrome.storage.sync.set({
      notificationSettings: {
        unproductiveThreshold: Number(unproductiveThreshold.value) || 30,
        dailySummaryTime: dailySummaryTime.value || '21:00'
      }
    });
  });
});
