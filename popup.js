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
    window.close();
  });

  chrome.storage.sync.get('tabLimit', ({ tabLimit }) => {
    const tabLimitElement = document.getElementById('tabLimit');
    tabLimitElement.value = tabLimit;
  });

  chrome.runtime.sendMessage('get_deleted_tabs', ({ deletedTabs }) => {
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
