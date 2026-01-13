
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MODELS, SYSTEM_INSTRUCTION } from "../constants";
import { ModelType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function askGemini(
  query: string,
  type: ModelType,
  image?: string
): Promise<GenerateContentResponse> {
  const modelToUse = getModelName(type);
  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTION
  };

  // Specialized configs
  if (type === ModelType.SEARCH) {
    config.tools = [{ googleSearch: {} }];
  } else if (type === ModelType.MAPS) {
    config.tools = [{ googleMaps: {} }];
    // Try to get location for maps grounding
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => 
        navigator.geolocation.getCurrentPosition(res, rej)
      );
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          }
        }
      };
    } catch (e) {
      console.warn("Location denied, skipping latLng config");
    }
  } else if (type === ModelType.THINKING) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  const parts: any[] = [{ text: query }];
  if (image) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: image.split(",")[1]
      }
    });
  }

  return await ai.models.generateContent({
    model: modelToUse,
    contents: { parts },
    config
  });
}

function getModelName(type: ModelType): string {
  switch (type) {
    case ModelType.FAST: return MODELS.LITE;
    case ModelType.SEARCH: return MODELS.FLASH;
    case ModelType.MAPS: return MODELS.MAPS;
    case ModelType.IMAGE: return MODELS.PRO;
    case ModelType.THINKING: return MODELS.PRO;
    default: return MODELS.LITE;
  }
}

// Live API Helpers
export function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
