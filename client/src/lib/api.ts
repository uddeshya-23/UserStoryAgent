import { z } from "zod";

// Define the story structure schema with enhanced fields
export const storySchema = z.object({
  Background: z.string(),
  "Current Behavior": z.array(z.string()),
  Environment: z.union([z.string(), z.record(z.unknown())]),
  "Business Impact": z.array(z.string()),
  "Technical Details": z.record(z.unknown()),
  "Proposed Solution": z.array(z.string()),
  "Acceptance Criteria": z.union([z.array(z.string()), z.record(z.unknown())]),
  "Research Analysis": z.object({
    "Market Research": z.array(z.string()),
    "Technical Feasibility": z.union([z.string(), z.record(z.unknown())]),
    "Risk Assessment": z.array(z.string()),
    "Implementation Timeline": z.union([z.string(), z.array(z.string()), z.array(z.record(z.unknown()))]),
    "Alternative Approaches": z.array(z.union([z.string(), z.record(z.unknown())])),
  }),
  "References": z.array(z.string()), // Added References field
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
    "Acceptance Criteria": [],
    "Research Analysis": {
      "Market Research": [],
      "Technical Feasibility": "",
      "Risk Assessment": [],
      "Implementation Timeline": "",
      "Alternative Approaches": []
    },
    "References": [] // Added References field to template
  };

  async generateStory(input: string, apiKey: string): Promise<Story> {
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
              content: `You are an expert project analyst and technical writer with deep reasoning capabilities. Generate a comprehensive story using this template: ${JSON.stringify(this.template)}. 
              Follow these steps:
              1. Research & Analysis Phase:
                - Conduct thorough market analysis and evaluate similar solutions
                - Perform detailed technical feasibility assessment considering architecture and scalability
                - Identify and assess potential risks with mitigation strategies
                - Create a realistic implementation timeline with milestones
                - Research and evaluate alternative approaches with pros/cons
              2. Story Generation Phase:
                - Synthesize research findings into clear background context
                - Document current behavior patterns and pain points with specific examples
                - Specify detailed technical requirements, dependencies, and constraints
                - Design comprehensive solution based on research findings
                - Create measurable acceptance criteria

              Use your reasoning capabilities to:
              - Draw connections between market trends and proposed solutions
              - Identify potential technical challenges and propose mitigation strategies
              - Calculate realistic timelines based on complexity analysis
              - Assess business value and ROI potential

              The response must be valid JSON with thorough analysis in each section.`
            },
            {
              role: 'user',
              content: input
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 4000,
          top_p: 0.95,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
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

      // Validate the response
      const result = storySchema.safeParse(story);
      if (!result.success) {
        console.error('Validation errors:', result.error);
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