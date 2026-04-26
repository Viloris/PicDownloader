const addButtonsToImage = (img) => {
  if (img.classList.contains('processed-image')) return;
  img.classList.add('processed-image');

  const btnGroup = document.createElement('div');
  btnGroup.className = 'img-save-btn-group-overlay';

  btnGroup.innerHTML = `
    <button class="save-btn-action" title="Mentés">💾</button>
    <button class="settings-btn-action" title="Beállítások">⚙️</button>
  `;

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
    if (!btnGroup.contains(e.relatedTarget)) {
      btnGroup.style.opacity = '0';
      btnGroup.style.visibility = 'hidden';
    }
  };

  img.addEventListener('mouseenter', showButtons);
  img.addEventListener('mouseleave', hideButtons);
  btnGroup.addEventListener('mouseleave', hideButtons);

  // Gomb események
  btnGroup.querySelector('.save-btn-action').onclick = (e) => {
    e.preventDefault();
    const btn = e.target;
    const originalIcon = btn.innerHTML;

    chrome.runtime.sendMessage({ action: "downloadImage", url: img.src });

    btn.innerHTML = '✅';
    setTimeout(() => {
      btn.innerHTML = originalIcon;
    }, 2000);
  };

  btnGroup.querySelector('.settings-btn-action').onclick = (e) => {
    e.preventDefault();
    browser.runtime.sendMessage({ action: "openOptions" });
  };
};

document.addEventListener('mouseover', (e) => {
  if (e.target.tagName === 'IMG') {
    addButtonsToImage(e.target);
  }
}, true);