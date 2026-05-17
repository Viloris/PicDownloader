let minImageWidth = PicDownloaderConfig.DEFAULT_SETTINGS.minImageWidth;

const cleanupFloatingButtons = () => {
  const overlays = document.querySelectorAll('.img-save-btn-group-overlay');
  overlays.forEach(el => el.remove());
};

const loadSettings = () => {
  chrome.storage.sync.get({ minImageWidth: PicDownloaderConfig.DEFAULT_SETTINGS.minImageWidth }, (items) => {
    minImageWidth = parseInt(items.minImageWidth, 10) || PicDownloaderConfig.DEFAULT_SETTINGS.minImageWidth;
  });
};

loadSettings();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.minImageWidth) {
    minImageWidth = parseInt(changes.minImageWidth.newValue, 10) || PicDownloaderConfig.DEFAULT_SETTINGS.minImageWidth;
  }
});

const addButtonsToImage = (img) => {
  if (img.classList.contains('processed-image')) return;
  img.classList.add('processed-image');

  const btnGroup = document.createElement('div');
  btnGroup.className = 'img-save-btn-group-overlay';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'save-btn-action';
  saveBtn.title = 'Mentés';
  saveBtn.textContent = '💾';

  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'settings-btn-action';
  settingsBtn.title = 'Beállítások';
  settingsBtn.textContent = '⚙️';

  const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|bmp|svg|tiff?|avif|ico)(\?.*)?$/i;
  const parentLink = img.closest('a');
  const linkHref = parentLink?.href;
  const isImageLink = linkHref && IMAGE_EXTENSIONS.test(linkHref);

  if (isImageLink) {
    const saveLinkBtn = document.createElement('button');
    saveLinkBtn.className = 'save-link-btn-action';
    saveLinkBtn.title = 'Linkelt kép mentése';
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

    chrome.runtime.sendMessage({ action: "downloadImage", url: img.src }, (response) => {
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
      chrome.runtime.sendMessage({ action: "downloadImage", url: linkHref }, (response) => {
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
    chrome.runtime.sendMessage({ action: "openOptions" });
  };
};

const getImageWidth = (img) => img.naturalWidth || img.width || img.clientWidth || img.getBoundingClientRect().width;

document.addEventListener('mouseover', (e) => {
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