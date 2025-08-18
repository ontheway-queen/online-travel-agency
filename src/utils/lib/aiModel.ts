import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export const chatGoogleGenerativeAI = new ChatGoogleGenerativeAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gemini-1.5-flash',
    temperature: 0.5,
});