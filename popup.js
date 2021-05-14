let tabList = [];

function init() {
  const saveButton = document.getElementById('save');

  saveButton.addEventListener('click', () => {
    let tabLimit = document.getElementById('tabLimit').value;
    if (!isNaN(tabLimit)) {
      tabLimit = Number(tabLimit);
      tabLimit = tabLimit > 50 ? 50 : tabLimit;
      tabLimit = tabLimit < 1 ? 1 : tabLimit;
      chrome.storage.sync.set({ tabLimit });
    }

    let archivedTabLimit = document.getElementById('archivedTabLimit').value;
    if (!isNaN(archivedTabLimit)) {
      archivedTabLimit = Number(archivedTabLimit);
      archivedTabLimit = archivedTabLimit > 50 ? 50 : archivedTabLimit;
      archivedTabLimit = archivedTabLimit < 1 ? 1 : archivedTabLimit;
      chrome.storage.sync.set({ archivedTabLimit });
    }

    window.close();
  });

  chrome.storage.sync.get(['tabLimit', 'archivedTabLimit'], ({ tabLimit, archivedTabLimit }) => {
    const tabLimitElement = document.getElementById('tabLimit');
    tabLimitElement.value = tabLimit || 10;
    const archivedTabLimitElement = document.getElementById('archivedTabLimit');
    archivedTabLimitElement.value = archivedTabLimit || 10;
  });

  chrome.storage.local.get('deletedTabs', ({ deletedTabs = [] }) => {
    const deletedTabList = document.getElementById('deletedTabList');

    for (const tab of deletedTabs) {
      const tabElement = document.createElement('li');
      tabElement.appendChild(document.createTextNode(tab.title));
      deletedTabList.appendChild(tabElement);

      tabElement.addEventListener('click', () => {
        chrome.tabs.create({ url: tab.url });
        deletedTabs = deletedTabs.filter(deletedTab => deletedTab.id !== tab.id);
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
