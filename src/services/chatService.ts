import faqs from '../data/faqs.json';
import { preprocess, getVector, cosineSimilarity } from '../lib/nlp.ts';
import { geminiService } from './geminiService.ts';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface ChatResult {
  user_query: string;
  matched_question: string | null;
  answer: string;
  confidence_score: number;
  suggestions: string[];
}

export class ChatService {
  private faqVectors: { faq: FAQ; vector: Record<string, number> }[];

  constructor() {
    this.faqVectors = faqs.map(faq => ({
      faq,
      vector: getVector(preprocess(faq.question))
    }));
  }

  public async findBestMatch(userInput: string): Promise<ChatResult> {
    const inputVector = getVector(preprocess(userInput));
    
    // 1. First attempt local keyword-based ranking (Super fast)
    const localRankings = this.faqVectors.map(({ faq, vector }) => ({
      faq,
      score: cosineSimilarity(inputVector, vector)
    })).sort((a, b) => b.score - a.score);

    const bestLocal = localRankings[0];

    // 2. If local match is very high, return immediately
    if (bestLocal.score >= 0.85) {
      return {
        user_query: userInput,
        matched_question: bestLocal.faq.question,
        answer: bestLocal.faq.answer,
        confidence_score: bestLocal.score,
        suggestions: localRankings.slice(1, 3).map(r => r.faq.question)
      };
    }

    // 3. Otherwise, use Gemini for Semantic Intelligence
    const aiResult = await geminiService.getSmartMatch(userInput);

    // Integrate AI result with original requirements logic
    const finalResult: ChatResult = {
      user_query: userInput,
      matched_question: aiResult.matched_question,
      answer: aiResult.answer || "Sorry, I couldn't find a relevant answer. Please rephrase your question.",
      confidence_score: aiResult.confidence_score,
      suggestions: aiResult.suggestions
    };

    // Rule gating based on user spec
    if (aiResult.confidence_score >= 0.75 && aiResult.answer) {
      // Good match - keep as is
    } else if (aiResult.confidence_score >= 0.5) {
      finalResult.answer = "I'm not 100% sure, but one of these might help:";
      finalResult.matched_question = null;
    } else {
      finalResult.answer = "Sorry, I couldn't find a relevant answer. Please rephrase your question.";
      finalResult.matched_question = null;
    }

    return finalResult;
  }
}

export const chatService = new ChatService();
