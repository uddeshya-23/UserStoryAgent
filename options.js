document.addEventListener('DOMContentLoaded', () => {
  // Load saved API key
  chrome.storage.sync.get(['apiKey'], (result) => {
    if (result.apiKey) {
      document.getElementById('apiKey').value = result.apiKey;
    }
  });

  // Save API key
  document.getElementById('save').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    const status = document.getElementById('status');

    if (!apiKey) {
      status.textContent = 'Error: API key is required';
      status.className = 'error';
      return;
    }

    chrome.storage.sync.set({ apiKey }, () => {
      status.textContent = 'Settings saved successfully!';
      status.className = 'success';
      setTimeout(() => {
        status.textContent = '';
        status.className = '';
      }, 3000);
    });
  });
});
