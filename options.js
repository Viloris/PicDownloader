const saveOptions = () => {
    const folder = document.getElementById('folder').value;
    chrome.storage.sync.set({ downloadFolder: folder }, () => {
        alert('Beállítások elmentve!');
    });
};

const restoreOptions = () => {
    chrome.storage.sync.get({ downloadFolder: 'mentett_kepek' }, (items) => {
        document.getElementById('folder').value = items.downloadFolder;
    });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);