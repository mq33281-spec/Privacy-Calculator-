
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const summarizeNote = async (content: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Please provide a very short (1 sentence) discrete summary for this private note so it doesn't look sensitive at a glance: "${content}"`,
    });
    return response.text || "No summary available";
  } catch (error) {
    console.error("AI Summarization failed:", error);
    return "Summary unavailable";
  }
};

export const getPrivacyTips = async (): Promise<string[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "List 5 essential tips for digital privacy and staying secure online in a JSON list of strings.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("AI Privacy Tips failed:", error);
    return ["Always use strong passwords.", "Enable Two-Factor Authentication.", "Be careful with public Wi-Fi."];
  }
};
