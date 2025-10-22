
import { GoogleGenAI, Type } from "@google/genai";
import type { DictionaryEntry } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    meaning: {
      type: Type.OBJECT,
      properties: {
        arabic: { type: Type.STRING },
        english: { type: Type.STRING },
      },
      required: ['arabic', 'english'],
    },
    synonyms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          arabic: { type: Type.STRING },
          english: { type: Type.STRING },
        },
        required: ['arabic', 'english'],
      },
    },
    antonyms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          arabic: { type: Type.STRING },
          english: { type: Type.STRING },
        },
        required: ['arabic', 'english'],
      },
    },
    verbForms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          formName: { type: Type.STRING, description: "e.g., 'Form I (Fa'ala)', 'Form II (Fa''ala)'" },
          arabic: { type: Type.STRING },
          english: { type: Type.STRING },
        },
        required: ['formName', 'arabic', 'english'],
      },
    },
    exampleSentences: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          arabic: { type: Type.STRING },
          english: { type: Type.STRING },
        },
        required: ['arabic', 'english'],
      },
    },
  },
  required: ['word', 'meaning', 'synonyms', 'antonyms', 'verbForms', 'exampleSentences'],
};

export const fetchWordDetails = async (word: string): Promise<DictionaryEntry> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the Arabic word: "${word}"`,
      config: {
        systemInstruction: `You are an expert Arabic-English lexicographer and linguist. Your task is to provide detailed information about an Arabic word for a student learning Arabic. For the given word, you must provide its meaning, synonyms, antonyms, common verb forms derived from its root, and an example sentence. If a category like antonyms doesn't apply (e.g., for a proper noun), return an empty array for that field. All information must be provided in both Arabic and English. Respond ONLY with a valid JSON object that adheres to the provided schema. Do not add any introductory text or explanations outside of the JSON structure.`,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsedData = JSON.parse(jsonString) as DictionaryEntry;
    return parsedData;
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    throw new Error("Failed to parse dictionary data from the API.");
  }
};
