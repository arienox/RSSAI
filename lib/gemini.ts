import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// API key - you'll need to set this in your environment variables
const apiKey = process.env.GEMINI_API_KEY || '';

// Initialize the Gemini API
export const genAI = new GoogleGenerativeAI(apiKey);

// Setting up safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Function to summarize an article using Gemini
export async function summarizeArticle(title: string, content: string): Promise<string> {
  if (!apiKey) {
    console.warn('Gemini API key not set. Please set GEMINI_API_KEY environment variable.');
    return '';
  }

  try {
    // Clean the content (remove HTML tags)
    const cleanContent = content.replace(/<[^>]*>/g, '');
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Generate a summary
    const prompt = `
      Please provide a concise summary of the following article:
      
      Title: ${title}
      
      Content: ${cleanContent.substring(0, 15000)} // Truncate to avoid token limits
      
      Provide a 2-3 sentence summary that captures the main points. Only return the summary, no preamble.
    `;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 200,
      },
    });
    
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating summary with Gemini:', error);
    return '';
  }
}

// Function to categorize article topics
export async function categorizeArticle(title: string, content: string): Promise<string[]> {
  if (!apiKey) {
    console.warn('Gemini API key not set. Please set GEMINI_API_KEY environment variable.');
    return [];
  }

  try {
    // Clean the content
    const cleanContent = content.replace(/<[^>]*>/g, '');
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Generate categories
    const prompt = `
      Please analyze the following article and provide up to 5 relevant topics or categories as tags:
      
      Title: ${title}
      
      Content: ${cleanContent.substring(0, 10000)} // Truncate to avoid token limits
      
      Return ONLY a comma-separated list of topics/categories, with no other text.
      Example response format: "Technology, AI, Privacy, Ethics"
    `;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 100,
      },
    });
    
    const response = result.response.text();
    return response.split(',').map(tag => tag.trim());
  } catch (error) {
    console.error('Error categorizing with Gemini:', error);
    return [];
  }
}

// Function to get personalized recommendations based on interests
export async function getRecommendations(
  articles: Array<{ title: string; content: string; id: number }>,
  userInterests: string[]
): Promise<number[]> {
  if (!apiKey) {
    console.warn('Gemini API key not set. Please set GEMINI_API_KEY environment variable.');
    return [];
  }

  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Prepare article summaries
    const articleSummaries = articles.map((article, index) => 
      `Article ${index + 1} (ID: ${article.id}): ${article.title}`
    ).join('\n');
    
    // Generate recommendations
    const prompt = `
      Based on the following user interests: ${userInterests.join(', ')}
      
      Please recommend which articles from this list would be most relevant:
      
      ${articleSummaries}
      
      Return ONLY a comma-separated list of article IDs, with no other text.
      Example response format: "123, 456, 789"
    `;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 100,
      },
    });
    
    const response = result.response.text();
    // Extract article IDs
    const recommendedIds = response
      .split(',')
      .map(id => parseInt(id.trim().replace(/[^0-9]/g, ''), 10))
      .filter(id => !isNaN(id));
    
    return recommendedIds;
  } catch (error) {
    console.error('Error generating recommendations with Gemini:', error);
    return [];
  }
} 