// Define chrome types for development environment
declare global {
  interface Window {
    chrome?: {
      storage?: {
        sync: {
          get(keys: string[]): Promise<{ [key: string]: any }>;
          set(items: { [key: string]: any }): Promise<void>;
        };
      };
    };
  }
}

class StorageService {
  async getApiKey(): Promise<string | null> {
    try {
      // Check if we're in a Chrome extension environment
      if (window.chrome?.storage) {
        const result = await window.chrome.storage.sync.get(['apiKey']);
        console.log("API key from Chrome storage:", result.apiKey);
        return result.apiKey || null;
      }
      // In development, use environment variable
      const apiKey = import.meta.env.VITE_GORQ_API_KEY || null;
      console.log("API key from environment variable:", apiKey);
      return apiKey;
    } catch (error) {
      console.error("Error retrieving API key:", error);
      // Fallback to environment variable if Chrome storage fails
      const fallbackApiKey = import.meta.env.VITE_GORQ_API_KEY || null;
      console.log("Fallback API key from environment variable:", fallbackApiKey);
      return fallbackApiKey;
    }
  }
}

export const storage = new StorageService();