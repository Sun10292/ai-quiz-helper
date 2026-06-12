import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseURL: 'https://api.deepseek.com',
    });
  }
  return client;
}

export default getClient;
