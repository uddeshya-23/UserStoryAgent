class AuthService {
  constructor() {
    this.storage = chrome.storage.sync;
  }

  async login() {
    try {
      // Request token using chrome.identity
      const token = await this.getAuthToken();
      // Get user info using the token
      const userInfo = await this.getUserInfo(token);
      // Store user info
      await this.storage.set({ user: userInfo });
      return userInfo;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Failed to login with Google');
    }
  }

  async getAuthToken() {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(token);
        }
      });
    });
  }

  async getUserInfo(token) {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  async getCurrentUser() {
    return new Promise((resolve) => {
      this.storage.get(['user'], (result) => {
        resolve(result.user || null);
      });
    });
  }

  async logout() {
    return new Promise((resolve) => {
      chrome.identity.clearAllCachedAuthTokens(() => {
        this.storage.remove(['user'], () => {
          resolve();
        });
      });
    });
  }
}

window.AuthService = AuthService;
