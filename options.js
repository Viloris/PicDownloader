let statusTimeoutId = null;
const UNIQUIFY = PicDownloaderConfig.CONFLICT_ACTIONS.UNIQUIFY;
const CONFLICT = PicDownloaderConfig.CONFLICT_ACTIONS.OVERWRITE;
const defaultSettings = PicDownloaderConfig.DEFAULT_SETTINGS;
const CONTACT = PicDownloaderConfig.CONTACT;
const UI_CONFIG = PicDownloaderConfig.UI;

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
    document.getElementById('modifierHeader').textContent = getMessage('modifierHeader');
    document.getElementById('modifierLabel').textContent = getMessage('modifierLabel');
    document.getElementById('buttonLabel').textContent = getMessage('buttonLabel');
    document.getElementById('buttonDisplayHeader').textContent = getMessage('buttonDisplayHeader');
    document.getElementById('buttonDisplayLabel').textContent = getMessage('buttonDisplayLabel');
    document.getElementById('buttonDisplayNote').textContent = getMessage('buttonDisplayNote');
    document.getElementById('modifierNote').textContent = getMessage('modifierNote');
    document.getElementById('leftClickOption').textContent = getMessage('leftClickOption');
    document.getElementById('rightClickOption').textContent = getMessage('rightClickOption');
    document.getElementById('bothClickOption').textContent = getMessage('bothClickOption');
    document.getElementById('filenameConflictHeader').textContent = getMessage('filenameConflictHeader');
    document.getElementById('conflictLabel').textContent = getMessage('conflictLabel');
    document.getElementById('conflictNote').textContent = getMessage('conflictNote');
    document.getElementById('saveSettings').textContent = getMessage('saveButton');
    document.getElementById('restoreDefaults').textContent = getMessage('restoreDefaultsButton');
    document.getElementById('closeBtn').title = getMessage('closeButtonTitle');
    document.getElementById('aboutHeader').textContent = getMessage('aboutHeader');
    document.getElementById('aboutText').textContent = getMessage('aboutText');
    const contactNode = document.getElementById('contactText');
    contactNode.textContent = '';
    const emailLink = document.createElement('a');
    emailLink.href = `mailto:${CONTACT.EMAIL}`;
    emailLink.target = CONTACT.TARGET;
    emailLink.rel = CONTACT.REL;
    emailLink.textContent = CONTACT.EMAIL_LABEL;
    const githubLink = document.createElement('a');
    githubLink.href = CONTACT.GITHUB;
    githubLink.target = CONTACT.TARGET;
    githubLink.rel = CONTACT.REL;
    githubLink.textContent = CONTACT.GITHUB_LABEL;
    contactNode.appendChild(emailLink);
    contactNode.appendChild(document.createTextNode(CONTACT.SEPARATOR));
    contactNode.appendChild(githubLink);
};

const showStatusMessage = (message) => {
    const status = document.getElementById('statusMessage');
    if (!status) return;
    status.textContent = message;
    status.classList.add(UI_CONFIG.STATUS_SHOW_CLASS);
    clearTimeout(statusTimeoutId);
    statusTimeoutId = setTimeout(() => {
        status.classList.remove(UI_CONFIG.STATUS_SHOW_CLASS);
        setTimeout(() => {
            status.textContent = '';
        }, UI_CONFIG.STATUS_CLEAR_MS);
    }, UI_CONFIG.STATUS_DISPLAY_MS);
};

const saveOptions = () => {
    const folder = document.getElementById('folder').value;
    const minWidth = parseInt(document.getElementById('minWidth').value, 10) || defaultSettings.minImageWidth;
    const conflictAction = document.getElementById('conflict').checked ? UNIQUIFY : CONFLICT;
    const triggerModifier = document.getElementById('modifierKey').value;
    const triggerButton = document.getElementById('clickButton').value;
    const showDownloadButtons = document.getElementById('showButtons').checked;
    chrome.storage.sync.set({
        downloadFolder: folder,
        minImageWidth: minWidth,
        conflictAction: conflictAction,
        triggerModifier: triggerModifier,
        triggerButton: triggerButton,
        showDownloadButtons: showDownloadButtons
    }, () => {
        showStatusMessage(getMessage('settingsSaved'));
    });
};

const restoreOptions = () => {
    chrome.storage.sync.get(defaultSettings, (items) => {
        document.getElementById('folder').value = items.downloadFolder || defaultSettings.downloadFolder;
        document.getElementById('minWidth').value = items.minImageWidth || defaultSettings.minImageWidth;
        document.getElementById('conflict').checked = items.conflictAction === UNIQUIFY;
        document.getElementById('modifierKey').value = items.triggerModifier || defaultSettings.triggerModifier;
        document.getElementById('clickButton').value = items.triggerButton || defaultSettings.triggerButton;
        document.getElementById('showButtons').checked = typeof items.showDownloadButtons === 'boolean' ? items.showDownloadButtons : defaultSettings.showDownloadButtons;
    });
};

const restoreDefaults = () => {
    document.getElementById('folder').value = defaultSettings.downloadFolder;
    document.getElementById('minWidth').value = defaultSettings.minImageWidth;
    document.getElementById('conflict').checked = defaultSettings.conflictAction === UNIQUIFY;
    document.getElementById('modifierKey').value = defaultSettings.triggerModifier;
    document.getElementById('clickButton').value = defaultSettings.triggerButton;
    document.getElementById('showButtons').checked = defaultSettings.showDownloadButtons;
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

