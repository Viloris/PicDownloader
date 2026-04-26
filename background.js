browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "downloadImage") {
    browser.storage.sync.get({ downloadFolder: 'mentett_kepek' }, (items) => {
      const folder = items.downloadFolder.trim();
      const rawFilename = request.url.split('/').pop().split('?')[0] || 'image.jpg';
      const filename = folder ? `${folder}/${rawFilename}` : rawFilename;

      browser.downloads.download({
        url: request.url,
        filename: filename,
        conflictAction: "uniquify"
      });
    });
  }

  if (request.action === "openOptions") {
    browser.runtime.openOptionsPage();
  }
});