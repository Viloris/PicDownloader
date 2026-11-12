if (typeof importScripts === 'function' && typeof PicDownloaderConfig === 'undefined') {
  importScripts('config.js');
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== 'install' && details.reason !== 'update') return;

  const updated = details.reason === 'update' ? '?updated=1' : '';
  chrome.tabs.create({ url: chrome.runtime.getURL(`options/index.html${updated}#about`) }, () => {
    if (chrome.runtime.lastError) {
      console.error('Could not open the about page:', chrome.runtime.lastError.message);
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "downloadImage") {
    chrome.storage.sync.get(PicDownloaderConfig.DEFAULT_SETTINGS, (items) => {
      const folder = (items.downloadFolder || '').trim();
      const rawFilename = request.url.split('/').pop().split('?')[0] || 'image.jpg';
      const filename = folder ? `${folder}/${rawFilename}` : rawFilename;
      const conflictAction = items.conflictAction || PicDownloaderConfig.CONFLICT_ACTIONS.UNIQUIFY;

      chrome.downloads.download({
        url: request.url,
        filename: filename,
        conflictAction: conflictAction
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          sendResponse({ status: 'error', message: chrome.runtime.lastError.message });
        } else {
          sendResponse({ status: 'success' });
        }
      });
    });
    return true;
  }

  if (request.action === "openOptions") {
    chrome.runtime.openOptionsPage();
  }
});