let tabMax = 10;
let archiveTabMax = 10;
let deletedTabs = [];

async function updateTabs(newTab) {
  const tabs = await chrome.tabs.query({});
  const numTabsToRemove = tabs.length - tabMax;

  if (numTabsToRemove > 0) {
    const tabsToRemove = tabs.filter((tab, index) => index < numTabsToRemove);
    const tabIdsToRemove = tabsToRemove.map(tab => tab.id);
    chrome.tabs.remove(tabIdsToRemove);
    deletedTabs.unshift(...tabsToRemove.filter(tab => !tab.url?.startsWith('chrome:') && !deletedTabs.find(deletedTab => deletedTab.url === tab.url)));
    deletedTabs = deletedTabs.filter(deletedTab => deletedTab.url !== newTab?.pendingUrl);
    if (deletedTabs.length > archiveTabMax) {
      deletedTabs = deletedTabs.slice(0, archiveTabMax);
    }
    chrome.storage.local.set({ deletedTabs });
    const badgeValue = deletedTabs.length === 0 ? '' : String(deletedTabs.length);
    chrome.action.setBadgeText({ text: badgeValue });
  }
}

chrome.storage.sync.get(['tabLimit', 'archivedTabLimit'], ({ tabLimit, archivedTabLimit }) => {
  tabMax = tabLimit;
  archiveTabMax = archivedTabLimit;
});

chrome.tabs.onCreated.addListener(async (newTab) => {
  updateTabs(newTab);
});

chrome.storage.onChanged.addListener(async ({ tabLimit, archivedTabLimit }) => {
  tabMax = tabLimit?.newValue || tabMax;
  archiveTabMax = archivedTabLimit?.newValue || archiveTabMax;
  updateTabs();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request === 'get_deleted_tabs') {
    sendResponse({ deletedTabs });
  }
});

chrome.storage.local.get('deletedTabs', ({ deletedTabs: deletedTabsLocal = [] }) => {
  deletedTabs = deletedTabsLocal;
});
