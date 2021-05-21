const DEFAULT_TAB_LIMIT = 10;
const DEFAULT_ARCHIVE_TAB_LIMIT = 50;

let tabMax;
let archiveTabMax;
let deletedTabs = [];

function updateBadge() {
  const badgeValue = deletedTabs.length === 0 ? '' : String(deletedTabs.length);
  chrome.action.setBadgeText({ text: badgeValue });
}

async function updateTabs(unpinned) {
  const tabs = await chrome.tabs.query({ pinned: false, currentWindow: true });
  const numTabsToRemove = tabs.length - tabMax;

  if (numTabsToRemove > 0) {
    if (unpinned) {
      // swap first and second tab locations so that newly unpinned tab isn't immediately removed
      [tabs[0], tabs[1]] = [tabs[1], tabs[0]];
    }
    const tabsToRemove = tabs.filter((tab, index) => index < numTabsToRemove);
    const tabIdsToRemove = tabsToRemove.map(tab => tab.id);
    chrome.tabs.remove(tabIdsToRemove);
    // remove duplicate archived tabs
    deletedTabs = deletedTabs.filter(deletedTab => !tabsToRemove.find(tab => deletedTab.url === tab.url && deletedTab.title === tab.title));
    // add newly removed tabs to top of the archived tabs list
    deletedTabs.unshift(...tabsToRemove.filter(tab => !tab.url?.startsWith('chrome:')));
    if (deletedTabs.length > archiveTabMax) {
      deletedTabs = deletedTabs.slice(0, archiveTabMax);
    }
    chrome.storage.local.set({ deletedTabs });
  }

  updateBadge();
}

function initEventHandlers() {
  chrome.storage.sync.get(['tabLimit', 'archivedTabLimit'], ({ tabLimit, archivedTabLimit }) => {
    tabMax = tabLimit || DEFAULT_TAB_LIMIT;
    archiveTabMax = archivedTabLimit || DEFAULT_ARCHIVE_TAB_LIMIT;

    if (!tabLimit || !archivedTabLimit) {
      chrome.storage.sync.set({ tabLimit: tabMax, archivedTabLimit: archiveTabMax });
    }
  });

  chrome.tabs.onCreated.addListener(async () => {
    updateTabs();
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (changeInfo.pinned === false) {
      updateTabs(true);
    }
  });

  chrome.storage.onChanged.addListener(async ({ tabLimit, archivedTabLimit, deletedTabs: deleteTabsLocal = [] }) => {
    tabMax = tabLimit?.newValue || tabMax;
    archiveTabMax = archivedTabLimit?.newValue || archiveTabMax;
    deletedTabs = deleteTabsLocal?.newValue || deletedTabs;

    if (tabLimit?.newValue) {
      updateTabs();
    }
  });

  chrome.storage.local.get('deletedTabs', ({ deletedTabs: deletedTabsLocal = [] }) => {
    deletedTabs = deletedTabsLocal;
    updateBadge();
  });
}

initEventHandlers();
