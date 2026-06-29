console.log('Content script loaded');

if (window.location.href) {
  chrome.runtime.sendMessage({ type: 'trackVisit', url: window.location.href });
}
