class StorageService {
  constructor() {
    this.storage = chrome.storage.sync;
  }

  async getApiKey() {
    return new Promise((resolve, reject) => {
      this.storage.get(['apiKey'], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result.apiKey);
        }
      });
    });
  }

  async setApiKey(apiKey) {
    return new Promise((resolve, reject) => {
      this.storage.set({ apiKey }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
}
