class GorqAPI {
  constructor() {
    this.baseUrl = 'https://api.groq.com/openai/v1';
    this.template = {
      "Background": "",
      "Current Behavior": [],
      "Environment": "",
      "Business Impact": [],
      "Technical Details": {},
      "Proposed Solution": [],
      "Acceptance Criteria": []
    };
  }

  async generateStory(input, apiKey) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: `You are a Jira story expert. Generate a structured story using this template: ${JSON.stringify(this.template)}. 
              Fill each section appropriately based on the user's input. The response should be valid JSON.`
            },
            {
              role: 'user',
              content: input
            }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        if (error.includes('invalid API key') || error.includes('Incorrect API key')) {
          throw new Error('Invalid API key. Please check your API key in the extension settings.');
        }
        throw new Error(error || 'Failed to generate story');
      }

      const data = await response.json();
      const story = JSON.parse(data.choices[0].message.content);

      // Validate response structure
      this.validateStory(story);

      return story;
    } catch (error) {
      if (error.message.includes('401')) {
        throw new Error('Invalid API key. Please check your API key in the extension settings.');
      }
      throw error;
    }
  }

  validateStory(story) {
    // Check all required fields exist
    for (const key of Object.keys(this.template)) {
      if (!(key in story)) {
        throw new Error(`Missing required field: ${key}`);
      }

      // Validate types match template
      if (Array.isArray(this.template[key])) {
        if (!Array.isArray(story[key])) {
          throw new Error(`${key} must be an array`);
        }
      } else if (typeof this.template[key] === 'object') {
        if (typeof story[key] !== 'object') {
          throw new Error(`${key} must be an object`);
        }
      } else if (typeof story[key] !== 'string') {
        throw new Error(`${key} must be a string`);
      }
    }
  }
}

window.GorqAPI = GorqAPI;