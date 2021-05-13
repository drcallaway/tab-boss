let tabMax = 10;
let deletedTabs = [];

async function updateTabs(newTab) {
  const tabs = await chrome.tabs.query({});
  const numTabsToRemove = tabs.length - tabMax;

  if (numTabsToRemove > 0) {
    const tabsToRemove = tabs.filter((tab, index) => index < numTabsToRemove);
    const tabIdsToRemove = tabsToRemove.map(tab => tab.id);
    chrome.tabs.remove(tabIdsToRemove);
    deletedTabs.push(...tabsToRemove.filter(tab => !tab.url?.startsWith('chrome:') && !deletedTabs.find(deletedTab => deletedTab.url === tab.url)));
    deletedTabs = deletedTabs.filter(deletedTab => deletedTab.url !== newTab?.pendingUrl);
    // chrome.storage.local.set({ deletedTabs });
    const badgeValue = deletedTabs.length === 0 ? '' : String(deletedTabs.length);
    chrome.action.setBadgeText({ text: badgeValue });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

chrome.storage.sync.get('tabLimit', ({ tabLimit }) => {
  tabMax = tabLimit;
});

chrome.tabs.onCreated.addListener(async (newTab) => {
  updateTabs(newTab);
});

chrome.storage.onChanged.addListener(async ({ tabLimit }) => {
  tabMax = tabLimit.newValue;
  updateTabs();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request === 'get_deleted_tabs') {
    sendResponse({ deletedTabs });
  }
});

// chrome.storage.local.get('deletedTabs', ({ deletedTabs: deletedTabsLocal = [] }) => {
//   deletedTabs = deletedTabsLocal;
// });
