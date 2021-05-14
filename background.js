const DEFAULT_TAB_LIMIT = 10;
const DEFAULT_ARCHIVE_TAB_LIMIT = 50;

let tabMax;
let archiveTabMax;
let deletedTabs = [];

function updateBadge() {
  const badgeValue = deletedTabs.length === 0 ? '' : String(deletedTabs.length);
  chrome.action.setBadgeText({ text: badgeValue });
}

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
  }

  updateBadge();
}

chrome.storage.sync.get(['tabLimit', 'archivedTabLimit'], ({ tabLimit, archivedTabLimit }) => {
  tabMax = tabLimit || DEFAULT_TAB_LIMIT;
  archiveTabMax = archivedTabLimit || DEFAULT_ARCHIVE_TAB_LIMIT;

  if (!tabLimit || !archivedTabLimit) {
    chrome.storage.sync.set({ tabLimit: tabMax, archivedTabLimit: archiveTabMax });
  }
});

chrome.tabs.onCreated.addListener(async (newTab) => {
  updateTabs(newTab);
});

chrome.storage.onChanged.addListener(async ({ tabLimit, archivedTabLimit, deletedTabs: deleteTabsLocal = [] }) => {
  tabMax = tabLimit?.newValue || tabMax;
  archiveTabMax = archivedTabLimit?.newValue || archiveTabMax;
  deletedTabs = deleteTabsLocal?.newValue || deletedTabs;
  updateTabs();
});

chrome.storage.local.get('deletedTabs', ({ deletedTabs: deletedTabsLocal = [] }) => {
  deletedTabs = deletedTabsLocal;
  updateBadge();
});
