browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "downloadImage") {
    browser.storage.sync.get(PicDownloaderConfig.DEFAULT_SETTINGS, (items) => {
      const folder = items.downloadFolder.trim();
      const rawFilename = request.url.split('/').pop().split('?')[0] || 'image.jpg';
      const filename = folder ? `${folder}/${rawFilename}` : rawFilename;
      const conflictAction = items.conflictAction || PicDownloaderConfig.CONFLICT_ACTIONS.UNIQUIFY;

      browser.downloads.download({
        url: request.url,
        filename: filename,
        conflictAction: conflictAction
      }).then(() => {
        sendResponse({ status: 'success' });
      }).catch((error) => {
        sendResponse({ status: 'error', message: error && error.message ? error.message : 'Download failed' });
      });
    });
    return true;
  }

  if (request.action === "openOptions") {
    browser.runtime.openOptionsPage();
  }
});