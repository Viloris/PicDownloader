globalThis.PicDownloaderConfig = {
    DEFAULT_SETTINGS: {
        downloadFolder: 'mentett_kepek',
        minImageWidth: 100,
        conflictAction: 'uniquify',
        triggerModifier: 'ctrl',
        triggerButton: 'left',
        showDownloadButtons: true
    },
    CONFLICT_ACTIONS: {
        UNIQUIFY: 'uniquify',
        OVERWRITE: 'overwrite'
    },
    CONTACT: {
        EMAIL: 'vilorisdeveloper@gmail.com',
        GITHUB: 'https://github.com/Viloris/PicDownloader',
        EMAIL_LABEL: 'Email',
        GITHUB_LABEL: 'GitHub',
        TARGET: '_blank',
        REL: 'noreferrer noopener',
        SEPARATOR: ' • '
    },
    UI: {
        STATUS_SHOW_CLASS: 'show',
        STATUS_DISPLAY_MS: 4000,
        STATUS_CLEAR_MS: 300
    },
    ACTION: {
        DOWNLOAD_IMAGE: 'downloadImage',
        OPEN_OPTIONS: 'openOptions'
    },
    EXTENSION: {
        CHROME_WEBSTORE_URL: 'https://chrome.google.com/webstore/detail/picdownloader/your-extension-id',
        FIREFOX_ADDONS_URL: 'https://addons.mozilla.org/hu/firefox/addon/picdownloader/',
        EDGE_ADDONS_URL: 'https://microsoftedge.microsoft.com/addons/detail/picdownloader/your-extension-id'
    }
};
