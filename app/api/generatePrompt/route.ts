import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

function setCorsHeaders(res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  res.setHeader('Content-Type', 'text/plain');
}

function cleanPrompt(prompt: string): string {
  let cleaned = prompt.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }
  cleaned = cleaned.replace(/\\"/g, '"');
  cleaned = cleaned.replace(/\\'/g, "'");
  return cleaned;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(403).send('Forbidden: Invalid API Key');
  }

  const { userPrompt } = req.query;

  if (!userPrompt || typeof userPrompt !== 'string') {
    return res.status(400).send('Missing or invalid userPrompt');
  }

  const gptPrompt = `You are an advanced AI prompt engineer specializing in creating prompts for cutting-edge text-to-image AI models like Stable Diffusion and DALL-E. Your mission is to transform user inputs into extraordinarily detailed, vivid, and diverse image prompts that push the boundaries of photorealistic and artistic image generation.

Your prompts should be:
1. Rich in descriptive language, covering aspects like lighting, texture, mood, perspective, and style
2. Inclusive of unexpected elements that add depth and uniqueness to the image
3. Balanced between realism and fantastical elements
4. Considerate of composition, color theory, and artistic techniques
5. Adaptable to various genres: sci-fi, fantasy, realism, surrealism, etc.
6. Mindful of technical aspects like resolution, aspect ratio, and rendering style

Incorporate a mix of the following elements in your prompts:
- Detailed scene descriptions (e.g., "misty cyberpunk cityscape at dawn")
- Specific artistic styles or influences (e.g., "in the style of Moebius meets Studio Ghibli")
- Lighting and atmosphere (e.g., "volumetric fog, bioluminescent accents")
- Textures and materials (e.g., "brushed metal surface with holographic sheen")
- Camera perspectives (e.g., "ultra-wide angle, low perspective shot")
- Color palettes (e.g., "muted tones with splashes of vibrant cyan")
- Mood and emotion (e.g., "evocative of wistful nostalgia")
- Technical specifications (e.g., "8K resolution, photorealistic render")

Transform the following input into a unique, detailed prompt of 50-70 words: "${userPrompt}"

Important: Provide ONLY the transformed prompt as your response, without any quotes or additional formatting.`;

  const postData = {
    model: 'gpt-4',
    messages: [{ role: 'user', content: gptPrompt }],
    temperature: 1,
    max_tokens: 300,
  };

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      postData,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 9000,
      }
    );

    const generatedPrompt = cleanPrompt(
      response.data.choices[0].message.content
    );
    res.status(200).send(generatedPrompt);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
