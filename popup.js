function init() {
  const saveButton = document.getElementById('save');

  saveButton.addEventListener('click', () => {
    let tabLimit = document.getElementById('tabLimit').value;
    if (!Number.isFinite(tabLimit)) {
      tabLimit = Number(tabLimit);
      tabLimit = tabLimit > 50 ? 50 : tabLimit;
      tabLimit = tabLimit < 1 ? 1 : tabLimit;
      chrome.storage.sync.set({ tabLimit });
    }

    let archivedTabLimit = document.getElementById('archivedTabLimit').value;
    if (!Number.isFinite(archivedTabLimit)) {
      archivedTabLimit = Number(archivedTabLimit);
      archivedTabLimit = archivedTabLimit > 99 ? 99 : archivedTabLimit;
      archivedTabLimit = archivedTabLimit < 1 ? 1 : archivedTabLimit;
      chrome.storage.sync.set({ archivedTabLimit });
    }

    window.close();
  });

  const clearButton = document.getElementById('clear');

  clearButton.addEventListener('click', () => {
    chrome.storage.local.set({ deletedTabs: [] });
    window.close();
  });

  chrome.storage.sync.get(['tabLimit', 'archivedTabLimit'], ({ tabLimit, archivedTabLimit }) => {
    const tabLimitElement = document.getElementById('tabLimit');
    tabLimitElement.value = tabLimit;
    const archivedTabLimitElement = document.getElementById('archivedTabLimit');
    archivedTabLimitElement.value = archivedTabLimit;
  });

  chrome.storage.local.get('deletedTabs', ({ deletedTabs = [] }) => {
    const deletedTabList = document.getElementById('deletedTabList');

    for (const tab of deletedTabs) {
      const tabElement = document.createElement('li');
      tabElement.setAttribute('title', tab.url);
      tabElement.classList.add('tabItem');
      tabElement.appendChild(document.createTextNode(tab.title));
      deletedTabList.appendChild(tabElement);

      tabElement.addEventListener('click', () => {
        chrome.tabs.create({ url: tab.url });
        deletedTabs = deletedTabs.filter(deletedTab => deletedTab.id !== tab.id);
        chrome.storage.local.set({ deletedTabs });
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
