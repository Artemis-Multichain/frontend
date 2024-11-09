import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  'Content-Type': 'text/plain',
};

// Helper function to clean the prompt
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

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return NextResponse.json(
      { error: 'Forbidden: Invalid API Key' },
      { status: 403, headers: corsHeaders }
    );
  }

  // Get user prompt from URL
  const { searchParams } = new URL(request.url);
  const userPrompt = searchParams.get('userPrompt');

  if (!userPrompt) {
    return NextResponse.json(
      { error: 'Missing or invalid userPrompt' },
      { status: 400, headers: corsHeaders }
    );
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

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: gptPrompt }],
        temperature: 1,
        max_tokens: 300,
      },
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

    return new NextResponse(generatedPrompt, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
