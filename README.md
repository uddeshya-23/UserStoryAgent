cp manifest.dev.json manifest.json
   ```
3. Update `manifest.json`:
   - Replace `REPLACE_WITH_YOUR_CLIENT_ID` with your OAuth client ID
   - Replace `REPLACE_WITH_YOUR_EXTENSION_KEY` with your extension key
4. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the extension directory
5. Note the generated Extension ID (you'll need this to update your OAuth client ID)

### 3. Configure Groq API

1. Get your Groq API key from [Groq Console](https://console.groq.com)
2. Add it in the extension options page:
   - Right-click the extension icon
   - Select "Options"
   - Enter your Groq API key
   - Click Save

### 4. Test the Extension

1. Click the extension icon
2. Click "Sign in with Google"
3. Verify that authentication works
4. Enter a story description
5. Generate a story

## Building for Production

1. Update `manifest.json` with production values
2. Create a production build:
   ```bash
   NODE_ENV=production ./package-extension.sh