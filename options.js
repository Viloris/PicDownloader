let statusTimeoutId = null;
const UNIQUIFY = PicDownloaderConfig.CONFLICT_ACTIONS.UNIQUIFY;
const CONFLICT = PicDownloaderConfig.CONFLICT_ACTIONS.OVERWRITE;
const defaultSettings = PicDownloaderConfig.DEFAULT_SETTINGS;

const getMessage = (key) => chrome.i18n.getMessage(key);

const localizePage = () => {
    document.title = getMessage('optionsPageTitle');
    document.getElementById('optionsHeader').textContent = getMessage('optionsHeader');
    document.getElementById('saveLocationHeader').textContent = getMessage('saveLocationHeader');
    document.getElementById('folderLabel').textContent = getMessage('folderLabel');
    document.getElementById('folder').placeholder = getMessage('folderPlaceholder');
    document.getElementById('folderNote').textContent = getMessage('folderNote');
    document.getElementById('smallImageFilterHeader').textContent = getMessage('smallImageFilterHeader');
    document.getElementById('minWidthLabel').textContent = getMessage('minWidthLabel');
    document.getElementById('minWidthNote').textContent = getMessage('minWidthNote');
    document.getElementById('filenameConflictHeader').textContent = getMessage('filenameConflictHeader');
    document.getElementById('conflictLabel').textContent = getMessage('conflictLabel');
    document.getElementById('conflictNote').textContent = getMessage('conflictNote');
    document.getElementById('saveSettings').textContent = getMessage('saveButton');
    document.getElementById('restoreDefaults').textContent = getMessage('restoreDefaultsButton');
    document.getElementById('closeBtn').title = getMessage('closeButtonTitle');
    document.getElementById('aboutHeader').textContent = getMessage('aboutHeader');
    document.getElementById('aboutText').innerHTML = getMessage('aboutText');
    document.getElementById('contactText').innerHTML = getMessage('contactText');
};

const showStatusMessage = (message) => {
    const status = document.getElementById('statusMessage');
    if (!status) return;
    status.textContent = message;
    status.classList.add('show');
    clearTimeout(statusTimeoutId);
    statusTimeoutId = setTimeout(() => {
        status.classList.remove('show');
        setTimeout(() => {
            status.textContent = '';
        }, 300);
    }, 4000);
};

const saveOptions = () => {
    const folder = document.getElementById('folder').value;
    const minWidth = parseInt(document.getElementById('minWidth').value, 10) || defaultSettings.minImageWidth;
    const conflictAction = document.getElementById('conflict').checked ? UNIQUIFY : CONFLICT;
    chrome.storage.sync.set({ downloadFolder: folder, minImageWidth: minWidth, conflictAction: conflictAction }, () => {
        showStatusMessage(getMessage('settingsSaved'));
    });
};

const restoreOptions = () => {
    chrome.storage.sync.get(defaultSettings, (items) => {
        document.getElementById('folder').value = items.downloadFolder || defaultSettings.downloadFolder;
        document.getElementById('minWidth').value = items.minImageWidth || defaultSettings.minImageWidth;
        document.getElementById('conflict').checked = items.conflictAction === UNIQUIFY;
    });
};

const restoreDefaults = () => {
    document.getElementById('folder').value = defaultSettings.downloadFolder;
    document.getElementById('minWidth').value = defaultSettings.minImageWidth;
    document.getElementById('conflict').checked = defaultSettings.conflictAction === UNIQUIFY;
    chrome.storage.sync.set(defaultSettings, () => {
        showStatusMessage(getMessage('defaultsRestored'));
    });
};

document.addEventListener('DOMContentLoaded', () => {
    localizePage();
    restoreOptions();
});
document.getElementById('saveSettings').addEventListener('click', saveOptions);
document.getElementById('restoreDefaults').addEventListener('click', restoreDefaults);
document.getElementById('closeBtn').addEventListener('click', () => window.close());

