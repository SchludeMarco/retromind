
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Note: Re-initializing in functions as per instructions to ensure latest API key usage
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateDeepQuestion(term: string, name: string, interests: string, decade: string): Promise<string> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-latest", // Using Flash-Lite for fast, low-latency interaction
      contents: `Handle als ein einfühlsamer Biografie-Begleiter. 
      Erstelle eine hochgradig personalisierte, tiefgreifende Frage für ${name}, um eine spezifische Kindheitserinnerung zu reaktivieren.
      Begriff: "${term}"
      Jahrzehnt-Kontext: "${decade}er Jahre"
      Interessen des Nutzers: "${interests}"
      
      Die Frage muss:
      1. Direkt auf den Begriff "${term}" Bezug nehmen.
      2. Die Interessen "${interests}" (wenn möglich) subtil einweben.
      3. Den Nutzer dazu anregen, ein spezifisches Detail, einen Geruch, ein Geräusch oder ein Gefühl von damals zu beschreiben.
      4. Im "Du"-Stil formuliert sein und nostalgisch wirken.
      
      Antworte NUR mit der Frage. Kein Einleitungssatz.`,
    });
    return response.text?.trim() || "Welche ganz persönliche Geschichte verbindest du mit diesem Teil deiner Vergangenheit?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Wenn du heute an diesen Gegenstand denkst, welches Bild aus deinem damaligen Kinderzimmer erscheint sofort vor deinem inneren Auge?";
  }
}

export async function analyzeMemoryImage(base64Image: string, mimeType: string): Promise<string> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: "Analysiere dieses Foto aus der Vergangenheit. Was siehst du? Beschreibe die Atmosphäre, die Details und versuche, die Zeitperiode zu schätzen. Sei nostalgisch und einfühlsam." }
        ]
      }
    });
    return response.text || "Ich konnte dieses Bild leider nicht analysieren.";
  } catch (error) {
    console.error("Image Analysis Error:", error);
    return "Fehler bei der Bildanalyse.";
  }
}

export async function generateVeoVideo(prompt: string, imageBase64?: string, mimeType?: string): Promise<string> {
  const ai = getAI();
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: imageBase64 ? {
      imageBytes: imageBase64,
      mimeType: mimeType || 'image/png'
    } : undefined,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");
  
  return `${downloadLink}&key=${process.env.API_KEY}`;
}
