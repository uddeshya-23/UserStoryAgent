// Listen for installation/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open options page on install for API key setup
    chrome.runtime.openOptionsPage();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openOptions") {
    chrome.runtime.openOptionsPage();
  }
});

// Handle auth token refresh
chrome.identity.onSignInChanged.addListener((account, signedIn) => {
  if (!signedIn) {
    // Clear stored user data when signed out
    chrome.storage.sync.remove(['user'], () => {
      console.log('User data cleared');
    });
  }
});