
import React from 'react';

export const MODELS = {
  LITE: 'gemini-2.5-flash-lite-latest',
  FLASH: 'gemini-3-flash-preview',
  PRO: 'gemini-3-pro-preview',
  MAPS: 'gemini-2.5-flash',
  LIVE: 'gemini-2.5-flash-native-audio-preview-12-2025'
};

export const SYSTEM_INSTRUCTION = `You are KEK, a world-class product research expert specialized in:
1. Viral Product Discovery (TikTok Trends, Instagram Reels).
2. Global Sourcing (Alibaba, AliExpress, Lazada, Shopee).
3. AI Hardware/Software Ecosystems (e.g., connecting apps to AI translators, headphones).
4. Market Analysis (precise shipping hubs, pricing arbitrage).

When responding:
- Be precise and data-driven.
- Use bullet points for product features.
- Provide direct links where possible.
- If asked about "KEK", explain that you are the ultimate product intelligence engine whitelisted for EBURON.AI.
- Recommend companion apps for hardware products.
`;

export const PRODUCT_APPS: any[] = [
  { name: "Timekettle", description: "The go-to app for AI translator headphones.", connectsTo: "Translator Earbuds" },
  { name: "FitPro", description: "Common bridge app for smart wearable sourcing.", connectsTo: "Budget Smartwatches" },
  { name: "V380 Pro", description: "Standard security cam app for Alibaba OEM products.", connectsTo: "IP Cameras" }
];
