let minImageWidth = PicDownloaderConfig.DEFAULT_SETTINGS.minImageWidth;
let triggerModifier = PicDownloaderConfig.DEFAULT_SETTINGS.triggerModifier;
let triggerButton = PicDownloaderConfig.DEFAULT_SETTINGS.triggerButton;
let showDownloadButtons = PicDownloaderConfig.DEFAULT_SETTINGS.showDownloadButtons;
let downloadImage = PicDownloaderConfig.ACTION.DOWNLOAD_IMAGE;
let openOptions = PicDownloaderConfig.ACTION.OPEN_OPTIONS;
const message = (key) => chrome.i18n.getMessage(key);

const cleanupFloatingButtons = () => {
  const overlays = document.querySelectorAll('.img-save-btn-group-overlay');
  overlays.forEach(el => el.remove());
  const processedImgs = document.querySelectorAll('img.processed-image');
  processedImgs.forEach(img => img.classList.remove('processed-image'));
};

const loadSettings = () => {
  chrome.storage.sync.get({
    minImageWidth: PicDownloaderConfig.DEFAULT_SETTINGS.minImageWidth,
    triggerModifier: PicDownloaderConfig.DEFAULT_SETTINGS.triggerModifier,
    triggerButton: PicDownloaderConfig.DEFAULT_SETTINGS.triggerButton,
    showDownloadButtons: PicDownloaderConfig.DEFAULT_SETTINGS.showDownloadButtons
  }, (items) => {
    minImageWidth = parseInt(items.minImageWidth, 10) || PicDownloaderConfig.DEFAULT_SETTINGS.minImageWidth;
    triggerModifier = items.triggerModifier || PicDownloaderConfig.DEFAULT_SETTINGS.triggerModifier;
    triggerButton = items.triggerButton || PicDownloaderConfig.DEFAULT_SETTINGS.triggerButton;
    showDownloadButtons = typeof items.showDownloadButtons === 'boolean' ? items.showDownloadButtons : PicDownloaderConfig.DEFAULT_SETTINGS.showDownloadButtons;
    if (!showDownloadButtons) {
      cleanupFloatingButtons();
    }
  });
};

loadSettings();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    if (changes.minImageWidth) {
      minImageWidth = parseInt(changes.minImageWidth.newValue, 10) || PicDownloaderConfig.DEFAULT_SETTINGS.minImageWidth;
    }
    if (changes.triggerModifier) {
      triggerModifier = changes.triggerModifier.newValue || PicDownloaderConfig.DEFAULT_SETTINGS.triggerModifier;
    }
    if (changes.triggerButton) {
      triggerButton = changes.triggerButton.newValue || PicDownloaderConfig.DEFAULT_SETTINGS.triggerButton;
    }
    if (changes.showDownloadButtons) {
      showDownloadButtons = changes.showDownloadButtons.newValue;
      if (!showDownloadButtons) {
        cleanupFloatingButtons();
      }
    }
  }
});

const isModifierPressed = (e) => {
  if (triggerModifier === 'alt') return e.altKey;
  if (triggerModifier === 'shift') return e.shiftKey;
  return e.ctrlKey;
};

const isTriggerButton = (buttonName) => {
  return triggerButton === 'both' || triggerButton === buttonName;
};

const getButtonName = (eventButton) => {
  if (eventButton === 0) return 'left';
  if (eventButton === 2) return 'right';
  return null;
};

const shouldSaveWithShortcut = (img, event) => {
  if (!img || img.tagName !== 'IMG') return false;
  if (!isModifierPressed(event)) return false;
  const buttonName = getButtonName(event.button);
  if (!buttonName || !isTriggerButton(buttonName)) return false;
  const imageWidth = getImageWidth(img);
  return imageWidth >= minImageWidth;
};

const saveImage = (url) => {
  chrome.runtime.sendMessage({ action: downloadImage, url: url });
};

const onImageShortcutClick = (e) => {
  if (shouldSaveWithShortcut(e.target, e)) {
    e.preventDefault();
    saveImage(e.target.src);
  }
};

const onContextMenu = (e) => {
  if (shouldSaveWithShortcut(e.target, e)) {
    e.preventDefault();
  }
};

document.addEventListener('mousedown', onImageShortcutClick, true);
document.addEventListener('contextmenu', onContextMenu, true);

const addButtonsToImage = (img) => {
  if (img.classList.contains('processed-image')) return;
  img.classList.add('processed-image');

  const btnGroup = document.createElement('div');
  btnGroup.className = 'img-save-btn-group-overlay';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'save-btn-action';
  saveBtn.title = message('saveImageTooltip');
  saveBtn.textContent = '💾';

  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'settings-btn-action';
  settingsBtn.title = message('settingsTooltip');
  settingsBtn.textContent = '⚙️';

  const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|bmp|svg|tiff?|avif|ico)(\?.*)?$/i;
  const parentLink = img.closest('a');
  const linkHref = parentLink?.href;
  const isImageLink = linkHref && IMAGE_EXTENSIONS.test(linkHref);

  if (isImageLink) {
    const saveLinkBtn = document.createElement('button');
    saveLinkBtn.className = 'save-link-btn-action';
    saveLinkBtn.title = message('saveLinkedImageTooltip');
    saveLinkBtn.textContent = '🔗';
    btnGroup.appendChild(saveLinkBtn);
  }

  btnGroup.appendChild(saveBtn);
  btnGroup.appendChild(settingsBtn);
  document.body.appendChild(btnGroup);

  const updatePosition = () => {
    const rect = img.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || window.pageXOffset || document.documentElement.scrollLeft;

    if (rect.width < 30 || rect.height < 30) {
      btnGroup.style.display = 'none';
      return;
    }

    btnGroup.style.display = 'flex';
    btnGroup.style.top = `${rect.top + scrollTop + 5}px`;
    btnGroup.style.left = `${rect.right + scrollLeft}px`;
  };

  const showButtons = () => {
    updatePosition();
    btnGroup.style.opacity = '1';
    btnGroup.style.visibility = 'visible';
  };

  const hideButtons = (e) => {
    if (!e.relatedTarget || !btnGroup.contains(e.relatedTarget)) {
      btnGroup.style.opacity = '0';
      btnGroup.style.visibility = 'hidden';
    }
  };

  img.addEventListener('mouseenter', showButtons);
  img.addEventListener('mouseleave', hideButtons);
  btnGroup.addEventListener('mouseleave', hideButtons);
  showButtons();

  btnGroup.querySelector('.save-btn-action').onclick = function (e) {
    e.preventDefault();
    const btn = e.currentTarget;
    const originalIcon = btn.textContent;

    chrome.runtime.sendMessage({ action: downloadImage, url: img.src }, (response) => {
      if (response && response.status === 'success') {
        btn.textContent = '✅';
      } else {
        btn.textContent = '❌';
        console.error('Image download failed:', response && response.message ? response.message : 'unknown error');
      }

      setTimeout(() => { btn.textContent = originalIcon; }, 2000);
    });
  };

  const saveLinkBtnEl = btnGroup.querySelector('.save-link-btn-action');
  if (saveLinkBtnEl) {
    saveLinkBtnEl.onclick = function (e) {
      e.preventDefault();
      const btn = e.currentTarget;
      const originalIcon = btn.textContent;
      chrome.runtime.sendMessage({ action: downloadImage, url: linkHref }, (response) => {
        if (response && response.status === 'success') {
          btn.textContent = '✅';
        } else {
          btn.textContent = '❌';
          console.error('Link image download failed:', response && response.message ? response.message : 'unknown error');
        }
        setTimeout(() => { btn.textContent = originalIcon; }, 2000);
      });
    };
  }
  btnGroup.querySelector('.settings-btn-action').onclick = (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({ action: openOptions });
  };
};

const getImageWidth = (img) => {
  const rect = img.getBoundingClientRect();
  return rect.width || img.clientWidth || img.width || img.naturalWidth;
};

document.addEventListener('mouseover', (e) => {
  if (!showDownloadButtons) {
    return;
  }
  if (e.target.tagName === 'IMG') {
    const imageWidth = getImageWidth(e.target);
    if (imageWidth >= minImageWidth) {
      addButtonsToImage(e.target);
    }
  }
}, true);

window.addEventListener('popstate', cleanupFloatingButtons);
window.addEventListener('beforeunload', cleanupFloatingButtons);
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    cleanupFloatingButtons();
  }
}).observe(document, { subtree: true, childList: true });