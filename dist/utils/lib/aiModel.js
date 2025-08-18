"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatGoogleGenerativeAI = void 0;
const google_genai_1 = require("@langchain/google-genai");
exports.chatGoogleGenerativeAI = new google_genai_1.ChatGoogleGenerativeAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gemini-1.5-flash',
    temperature: 0.5,
});
