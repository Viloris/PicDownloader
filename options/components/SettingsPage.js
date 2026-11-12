const { DEFAULT_SETTINGS, CONFLICT_ACTIONS, CONTACT, UI } = PicDownloaderConfig;
const message = (key) => chrome.i18n.getMessage(key);
const element = (id) => document.getElementById(id);
let statusTimeout;

function showPage() {
  const page = location.hash === '#about' ? 'about' : 'settings';
  for (const id of ['settings', 'about']) {
    element(id).hidden = id !== page;
    const link = document.querySelector(`.sideBar a[href="#${id}"]`);
    link.parentElement.classList.toggle('selected', id === page);
    if (id === page) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

showPage();
window.addEventListener('hashchange', showPage);

document.title = `${message('optionsPageTitle')} - PicDownloader`;
document.documentElement.lang = chrome.i18n.getUILanguage();
document.querySelectorAll('[data-message]').forEach((node) => {
  node.textContent = message(node.dataset.message);
});
element('folder').placeholder = message('folderPlaceholder');

const contact = element('contactText');
for (const [url, label] of [[`mailto:${CONTACT.EMAIL}`, CONTACT.EMAIL_LABEL], [CONTACT.GITHUB, CONTACT.GITHUB_LABEL]]) {
  if (contact.childNodes.length) contact.append(document.createTextNode(CONTACT.SEPARATOR));
  const link = document.createElement('a');
  link.href = url;
  link.target = CONTACT.TARGET;
  link.rel = CONTACT.REL;
  link.textContent = label;
  contact.append(link);
}

function showStatus(text, isError = false) {
  const status = element('statusMessage');
  clearTimeout(statusTimeout);
  status.textContent = text;
  status.classList.toggle('error', isError);
  if (!isError) {
    statusTimeout = setTimeout(() => { status.textContent = ''; }, UI.STATUS_DISPLAY_MS);
  }
}

function reportStorageError(error) {
  console.error('Settings storage error:', error.message);
  showStatus(message('settingsStorageError'), true);
}

function displaySettings(settings) {
  element('folder').value = settings.downloadFolder;
  element('minWidth').value = settings.minImageWidth;
  element('conflict').checked = settings.conflictAction === CONFLICT_ACTIONS.UNIQUIFY;
  element('modifierKey').value = settings.triggerModifier;
  element('clickButton').value = settings.triggerButton;
  element('showButtons').checked = settings.showDownloadButtons;
}

chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
  if (chrome.runtime.lastError) {
    reportStorageError(chrome.runtime.lastError);
    return;
  }
  displaySettings(settings);
  element('settingsFields').disabled = false;
});

element('settingsForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const settings = {
    downloadFolder: element('folder').value,
    minImageWidth: Number(element('minWidth').value),
    conflictAction: element('conflict').checked ? CONFLICT_ACTIONS.UNIQUIFY : CONFLICT_ACTIONS.OVERWRITE,
    triggerModifier: element('modifierKey').value,
    triggerButton: element('clickButton').value,
    showDownloadButtons: element('showButtons').checked
  };
  chrome.storage.sync.set(settings, () => {
    if (chrome.runtime.lastError) {
      reportStorageError(chrome.runtime.lastError);
      return;
    }
    showStatus(message('settingsSaved'));
  });
});

element('restoreDefaults').addEventListener('click', () => {
  chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
    if (chrome.runtime.lastError) {
      reportStorageError(chrome.runtime.lastError);
      return;
    }
    displaySettings(DEFAULT_SETTINGS);
    showStatus(message('defaultsRestored'));
  });
});
