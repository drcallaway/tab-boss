let tabMax = 10;

async function updateTabs() {
  const tabs = await chrome.tabs.query({});
  const numTabsToRemove = tabs.length - tabMax;

  if (numTabsToRemove > 0) {
    const tabsToRemove = tabs.map(tab => tab.id).filter((tabId, index) => index < numTabsToRemove);
    chrome.tabs.remove(tabsToRemove);
  }

  chrome.action.setBadgeText({text: '1'});
}

chrome.storage.sync.get('tabLimit', ({ tabLimit }) => {
  console.log(tabLimit);
  tabMax = tabLimit;
});

chrome.tabs.onCreated.addListener(async () => {
  updateTabs()
});

chrome.storage.onChanged.addListener(async ({ tabLimit }) => {
  tabMax = tabLimit.newValue;
  updateTabs();
});
