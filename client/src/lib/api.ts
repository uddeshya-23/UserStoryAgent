import { z } from "zod";

// Define the story structure schema
export const storySchema = z.object({
  Background: z.string(),
  "Current Behavior": z.array(z.string()),
  Environment: z.union([z.string(), z.record(z.unknown())]),
  "Business Impact": z.array(z.string()),
  "Technical Details": z.record(z.unknown()),
  "Proposed Solution": z.array(z.string()),
  "Acceptance Criteria": z.array(z.string())
});

export type Story = z.infer<typeof storySchema>;

class GorqAPI {
  private baseUrl = 'https://api.groq.com/openai/v1';
  private template = {
    "Background": "",
    "Current Behavior": [],
    "Environment": "",
    "Business Impact": [],
    "Technical Details": {},
    "Proposed Solution": [],
    "Acceptance Criteria": []
  };

  async performResearch(input: string, apiKey: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'DeepSeek-R1-Distill-Llama-70b',
          messages: [
            {
              role: 'system',
              content: `You are a research assistant. Perform research based on the user's input and provide a detailed summary.`
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
        throw new Error(error || 'Failed to perform research');
      }

      const data = await response.json();
      console.log("Research response data:", data);
      return data.choices[0].message.content;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred during research');
    }
  }

  async generateStory(input: string, apiKey: string): Promise<Story> {
    try {
      // Perform research first
      const researchSummary = await this.performResearch(input, apiKey);

      // Use the research summary to generate the story
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'DeepSeek-R1-Distill-Llama-70b',
          messages: [
            {
              role: 'system',
              content: `You are a Jira story expert. Generate a structured story using this template: ${JSON.stringify(this.template)}. 
              Fill each section appropriately based on the research summary. The response should be valid JSON.`
            },
            {
              role: 'user',
              content: researchSummary
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
      console.log("API response data:", data);
      const story = JSON.parse(data.choices[0].message.content);

      // Validate the response
      const result = storySchema.safeParse(story);
      if (!result.success) {
        console.error("Validation errors:", result.error.errors);
        throw new Error('Invalid response format from API');
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('Invalid API key. Please check your API key in the extension settings.');
        }
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }
}

export const api = new GorqAPI();