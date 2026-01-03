
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const fetchExchangeRates = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Get the current exchange rates for 1 USD to LKR and 1 EUR to LKR. Return ONLY the values as a JSON object.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            usdToLkr: { type: Type.NUMBER },
            eurToLkr: { type: Type.NUMBER }
          },
          required: ["usdToLkr", "eurToLkr"]
        }
      }
    });

    const data = JSON.parse(response.text);
    // Requirements: USD 309.1 -> 310, EURO 365.1 -> 366 (Round up)
    return {
      usd: Math.ceil(data.usdToLkr),
      euro: Math.ceil(data.eurToLkr)
    };
  } catch (error) {
    console.error("Failed to fetch rates:", error);
    // Fallback static rates if API fails
    return { usd: 310, euro: 366 };
  }
};
