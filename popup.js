let apiKey = null;

document.addEventListener('DOMContentLoaded', async () => {
  const storage = new StorageService();
  const api = new GorqAPI();
  const auth = new AuthService();

  // UI Elements
  const generateBtn = document.getElementById('generate');
  const copyBtn = document.getElementById('copy');
  const inputText = document.getElementById('input-text');
  const outputSection = document.getElementById('output-section');
  const output = document.getElementById('output');
  const spinner = document.querySelector('.spinner');
  const buttonText = document.querySelector('.button-text');
  const errorBanner = document.getElementById('error-banner');
  const errorMessage = document.getElementById('error-message');
  const configureApiBtn = document.getElementById('configure-api');
  const authSection = document.getElementById('auth-section');
  const mainSection = document.getElementById('main-section');
  const loginBtn = document.getElementById('login');
  const logoutBtn = document.getElementById('logout');
  const userAvatar = document.getElementById('user-avatar');
  const userEmail = document.getElementById('user-email');

  // Check authentication state
  const user = await auth.getCurrentUser();
  if (!user) {
    authSection.classList.remove('hidden');
  } else {
    await setupAuthenticatedUI(user);
  }

  // Login handler
  loginBtn.addEventListener('click', async () => {
    try {
      const user = await auth.login();
      await setupAuthenticatedUI(user);
    } catch (error) {
      showError(error.message);
    }
  });

  // Logout handler
  logoutBtn.addEventListener('click', async () => {
    await auth.logout();
    authSection.classList.remove('hidden');
    mainSection.classList.add('hidden');
  });

  async function setupAuthenticatedUI(user) {
    authSection.classList.add('hidden');
    mainSection.classList.remove('hidden');
    userAvatar.src = user.picture || 'icons/default-avatar.png';
    userEmail.textContent = user.email;

    // Load API key
    try {
      apiKey = await storage.getApiKey();
      if (!apiKey) {
        throw new Error('API key not configured');
      }
    } catch (error) {
      showError('Please configure your API key to continue');
      return;
    }
  }

  // Generate story
  generateBtn.addEventListener('click', async () => {
    const input = inputText.value.trim();

    if (!input) {
      showError('Please enter a story description');
      return;
    }

    setLoading(true);

    try {
      const story = await api.generateStory(input, apiKey);
      displayOutput(story);
      outputSection.classList.remove('hidden');
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  });

  // Copy to clipboard
  copyBtn.addEventListener('click', () => {
    const content = output.innerText;
    navigator.clipboard.writeText(content).then(() => {
      const originalText = copyBtn.innerText;
      copyBtn.innerText = 'Copied!';
      setTimeout(() => {
        copyBtn.innerText = originalText;
      }, 2000);
    });
  });

  // Configure API key
  configureApiBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  function setLoading(loading) {
    spinner.classList.toggle('hidden', !loading);
    buttonText.classList.toggle('hidden', loading);
    generateBtn.disabled = loading;
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorBanner.classList.remove('hidden');
  }

  function displayOutput(story) {
    let html = '';

    // Format each section
    for (const [key, value] of Object.entries(story)) {
      html += `<div class="section">
        <h4>${key}</h4>
        ${formatValue(value)}
      </div>`;
    }

    output.innerHTML = html;
  }

  function formatValue(value) {
    if (Array.isArray(value)) {
      return `<ul>${value.map(item => `<li>${item}</li>`).join('')}</ul>`;
    } else if (typeof value === 'object' && value !== null) {
      return `<pre>${JSON.stringify(value, null, 2)}</pre>`;
    } else {
      return `<p>${value || 'N/A'}</p>`;
    }
  }
});