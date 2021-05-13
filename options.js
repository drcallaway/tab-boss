function init() {
  const saveButton = document.getElementById('save');

  saveButton.addEventListener('click', () => {
    const tabLimit = Number(document.getElementById('tabLimit').value);
    chrome.storage.sync.set({ tabLimit });
    window.close();
  });
}

document.addEventListener('DOMContentLoaded', init);
