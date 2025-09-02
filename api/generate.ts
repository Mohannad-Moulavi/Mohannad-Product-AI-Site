import { GoogleGenAI, Modality } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// This is a serverless function, so process.env works here securely.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // We send a clear error if the API key isn't configured on Vercel
  throw new Error("API_KEY environment variable not set in Vercel.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// The prompt is moved here to the backend
const buildPrompt = (productName: string): string => {
  return `
**PRIMARY DIRECTIVE: 100% FAITHFUL PHOTO-REALISTIC TRANSPLANT**

Your single, overriding mission is to perform a perfect, photorealistic *transplant* of the product from the user's photo into the provided bowl. The final result must be indistinguishable from a real photograph where the original product was used.

**NON-NEGOTIABLE RULE: ZERO CREATIVE INTERPRETATION.** You are strictly forbidden from stylizing, enhancing, beautifying, or creatively interpreting the product in any way. Your job is clinical replication, not artistic creation. The final product in the bowl must look *exactly* like the one in the source photo, simply placed in a new setting.

**Your Task:**
You will receive two images. The first is the master bowl. The second contains the product named '${productName}'. Your job is to place the product from the second image into the first with maximum, uncompromising realism.

**CRITICAL EXECUTION STEPS:**

1.  **IDENTIFY & REPLICATE VISUAL DNA (Highest Priority):** Before doing anything else, perform a pixel-level analysis of the product in the second image to understand its core visual properties. Your goal is to replicate these with scientific precision.
    *   **COLOR (رنگ):** Capture the *exact* color profile with 100% fidelity. This includes subtle gradients, variations, and the specific colors of the product's **interior and exterior**. You are forbidden from color-correcting or altering the hue. If the source product is a dull yellow, the final product must be the same dull yellow.
    *   **TEXTURE (نوع):** Recreate the physical surface texture. Is it rough, smooth, grainy, fibrous? The final render must show this texture perfectly under the new lighting. Do not smooth or alter the texture in any way.
    *   **SHEEN (براقیش):** Replicate the *exact* level of reflectivity. A matte product must remain matte. A shiny product must remain shiny. Do not add or remove gloss.

2.  **APPLY LOGICAL SCALING:** Use the product's name and your visual analysis to determine a realistic real-world size. Scale the product to fit naturally and believably within the bowl. It must not look comically large or small.

3.  **SEAMLESS COMPOSITION:**
    *   Flawlessly isolate the product from its original background.
    *   Place it realistically *inside* the bowl, respecting its shape and depth.
    *   The bowl itself **must not be changed**. The bowl, its lighting, and shadows must be identical to the source image.
    *   Render lighting and soft shadows on the product that perfectly match the bowl's existing studio lighting. This new light must interact realistically with the product's replicated Color, Texture, and Sheen.

4.  **FINAL FIDELITY CHECK (MANDATORY):** Before outputting the final image, you MUST perform a self-critique. Compare your generated product placement against the source product image.
    *   Is the color, both inside and out, a perfect 1:1 match?
    *   Is the texture identical?
    *   Is the sheen and reflectivity exactly the same?
    *   If there are *any* discrepancies, you must discard the result and repeat the process until you achieve a perfect replication.

**FINAL OUTPUT REQUIREMENTS:**
*   The final image must be a 1:1 square aspect ratio.
*   The background must be pure, solid white (#FFFFFF).
*   The output must be a single, high-resolution PNG image that is indistinguishable from a real photograph.
  `;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { productImageData, bowlImageData, productName } = req.body;

    if (!productImageData || !bowlImageData || !productName) {
      return res.status(400).json({ error: 'Missing required parameters: productImageData, bowlImageData, and productName are required.' });
    }

    const prompt = buildPrompt(productName);
    
    const bowlImagePart = { inlineData: bowlImageData };
    const productImagePart = { inlineData: productImageData };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts: [bowlImagePart, productImagePart, textPart] },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes = part.inlineData.data;
        // The frontend expects a full data URL
        const dataUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        return res.status(200).json({ generatedImage: dataUrl });
      }
    }

    // If the loop finishes and no image was found
    throw new Error("No image part was found in the Gemini API response.");

  } catch (error: any) {
    console.error("Error in Vercel function:", error);
    // Send a generic error message to the client
    return res.status(500).json({ error: "An unexpected error occurred while generating the image." });
  }
}
