// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateStory") {
    // Extract current page context
    const projectContext = {
      projectKey: document.querySelector('[data-testid="project-key"]')?.textContent 
        || document.querySelector('.project-key')?.textContent 
        || '',
      issueType: document.querySelector('[data-testid="issue-type-select"]')?.value 
        || document.querySelector('#issuetype-field')?.value 
        || '',
      summary: document.querySelector('#summary')?.value || ''
    };
    
    // Send context back to popup
    sendResponse(projectContext);
  }
  return true; // Keep the message channel open for async response
});

// Add story generation button to Jira interface if on create issue page
function addStoryButton() {
  if (window.location.href.includes('create-issue')) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'story-generator-button';
    buttonContainer.innerHTML = `
      <button class="aui-button" id="generate-story-btn">
        Generate Story
      </button>
    `;
    
    const descriptionField = document.querySelector('#description');
    if (descriptionField) {
      descriptionField.parentElement.appendChild(buttonContainer);
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', addStoryButton);