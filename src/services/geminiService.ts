import { GoogleGenAI, Type } from "@google/genai";
import faqs from "../data/faqs.json";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GeminiMatchResult {
  matched_question: string | null;
  answer: string | null;
  confidence_score: number;
  suggestions: string[];
}

export class GeminiService {
  /**
   * Uses Gemini to perform semantic matching against the predefined FAQ dataset.
   */
  async getSmartMatch(userQuery: string): Promise<GeminiMatchResult> {
    const systemPrompt = `
      You are an FAQ matching engine. You have a predefined dataset of FAQs.
      DATASET:
      ${JSON.stringify(faqs, null, 2)}

      OBJECTIVE:
      Match the user query with the MOST relevant FAQ from the DATASET.
      
      RULES:
      1. Strictly use the DATASET. Do NOT hallucinate answers.
      2. Calculate a confidence score (0.0 to 1.0) based on semantic similarity.
      3. If match >= 0.75, return the exact matched_question and answer.
      4. If match is 0.5 to 0.75, suggest top 2 similar questions.
      5. If match < 0.5, set matched_question to null.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userQuery,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matched_question: { type: Type.STRING, nullable: true },
              answer: { type: Type.STRING, nullable: true },
              confidence_score: { type: Type.NUMBER },
              suggestions: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
            },
            required: ["confidence_score", "suggestions"],
          },
        },
      });

      const result = JSON.parse(response.text || "{}");
      return {
        matched_question: result.matched_question || null,
        answer: result.answer || null,
        confidence_score: result.confidence_score || 0,
        suggestions: result.suggestions || [],
      };
    } catch (error) {
      console.error("Gemini Match Error:", error);
      return {
        matched_question: null,
        answer: null,
        confidence_score: 0,
        suggestions: [],
      };
    }
  }
}

export const geminiService = new GeminiService();
