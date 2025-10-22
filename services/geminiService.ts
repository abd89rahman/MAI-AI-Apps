import { GoogleGenAI, Type, Modality } from "@google/genai";
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
    root: {
        type: Type.OBJECT,
        description: "The triliteral root of the word, if applicable.",
        properties: {
            letters: { type: Type.STRING, description: "The root letters, e.g., 'ك ت ب'." },
            explanation: { type: Type.STRING, description: "An explanation of the root's core meaning and how it influences the searched word." },
            derivedWords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  arabic: { type: Type.STRING },
                  english: { type: Type.STRING },
                },
                required: ['arabic', 'english'],
              },
              description: "Other words derived from the same root."
            }
        },
        required: ['letters', 'explanation', 'derivedWords'],
    },
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
    quranVerses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          verse: { type: Type.STRING, description: "The full Quranic verse in Arabic." },
          surah: { type: Type.STRING, description: "The name of the Surah and Ayah number, e.g., 'Surah Al-Baqarah, 2:255'." },
          english: { type: Type.STRING, description: "The English translation of the verse." },
        },
        required: ['verse', 'surah', 'english'],
      },
    },
    hadithNarrations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          hadith: { type: Type.STRING, description: "The full Hadith narration in Arabic." },
          source: { type: Type.STRING, description: "The source of the Hadith, e.g., 'Sahih al-Bukhari 52'." },
          english: { type: Type.STRING, description: "The English translation of the Hadith." },
        },
        required: ['hadith', 'source', 'english'],
      },
    },
    poems: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                poem: { type: Type.STRING, description: "The full line or snippet of the poem in Arabic." },
                poet: { type: Type.STRING, description: "The name of the poet, e.g., 'Imru' al-Qais' or a description like 'Contemporary religious poem'." },
                english: { type: Type.STRING, description: "The English translation of the poem." },
            },
            required: ['poem', 'poet', 'english'],
        },
    },
  },
  required: ['word', 'meaning', 'synonyms', 'antonyms', 'verbForms', 'exampleSentences', 'quranVerses', 'hadithNarrations', 'poems', 'root'],
};

export const fetchWordDetails = async (word: string): Promise<DictionaryEntry> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the Arabic word: "${word}"`,
      config: {
        systemInstruction: `You are an expert Arabic-English lexicographer, Islamic scholar, and an expert in classical and contemporary Arabic literature. Your task is to provide detailed information about an Arabic word for a student learning Arabic. For the given word, you must provide:
1. The triliteral root (الجذر الثلاثي), its core meaning, and a few other words derived from it. If the word has no triliteral root, return null for the 'root' field.
2. Its meaning, synonyms, antonyms, common verb forms, and an example sentence.
3. Relevant verses from the Quran, narrations from Hadith, and related Arabic poems (from the Jahili period or contemporary religious ones).
IMPORTANT: When quoting Quranic verses or Hadith narrations, you must use the exact text without any paraphrasing. Ensure accuracy by referencing reliable sources such as tanzil.net for the Quran and sunnah.com for Hadith. The source attribution (Surah and Ayah number for Quran, collection and number for Hadith) must be precise. If a category like antonyms, Quran verses, Hadith narrations, or poems doesn't apply or none are found, return an empty array for that field. All information must be provided in both Arabic and English. Crucially, you MUST add full and accurate diacritics (tashkeel/shakl) to ALL Arabic words in your response. This is essential for pronunciation. Respond ONLY with a valid JSON object that adheres to the provided schema. Do not add any introductory text or explanations outside of the JSON structure.`,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsedData = JSON.parse(jsonString) as DictionaryEntry;

    // Fetch pronunciation audio
    try {
        const ttsResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Pronounce the following Arabic word accurately: ${parsedData.word}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            parsedData.pronunciationAudio = base64Audio;
        }
    } catch (ttsError) {
        console.error("Error fetching pronunciation audio:", ttsError);
        // Continue without audio if TTS fails
    }

    return parsedData;
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    throw new Error("Failed to parse dictionary data from the API.");
  }
};