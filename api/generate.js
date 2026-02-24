import OpenAI, { toFile } from "openai";

export const config = { maxDuration: 120 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { photoBase64, inspoBase64, userApiKey } = req.body;

    if (!photoBase64 || !inspoBase64) {
      return res.status(400).json({ error: "Envie ambas as imagens em base64" });
    }

    const apiKey = userApiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: "Nenhuma API key configurada. Cole sua key da OpenAI nas configurações.",
      });
    }

    const openai = new OpenAI({ apiKey });

    // Strip data-uri prefix if present
    const strip = (b64) => b64.replace(/^data:image\/\w+;base64,/, "");

    const photoBuf = Buffer.from(strip(photoBase64), "base64");
    const inspoBuf = Buffer.from(strip(inspoBase64), "base64");

    const photoFile = await toFile(photoBuf, "photo.png", { type: "image/png" });
    const inspoFile = await toFile(inspoBuf, "inspo.png", { type: "image/png" });

    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: [photoFile, inspoFile],
      prompt: `You are receiving two images.

IMAGE 1 is MY PHOTO — the person in it must be kept 100% intact: face, body, skin tone, hair, clothing, pose, accessories, expression, framing, and proportions. Do NOT retouch, beautify, or alter the person in any way.

IMAGE 2 is the INSPIRATION — use ONLY its background/scenery style (environment, colors, lighting, depth, mood, atmosphere).

TASK: Replace ONLY the background of IMAGE 1 with a background inspired by IMAGE 2.

MANDATORY RULES:
• The person from IMAGE 1 must remain pixel-perfect — zero modifications.
• Do NOT change clothing colors, skin tone, sharpness, or body shape.
• Adjust ONLY the background lighting and shadows so the scene looks natural and coherent.
• Maintain the original perspective and depth of field (including bokeh if present).
• If there is ANY conflict between the new scenery and preserving the person, ALWAYS prioritize preserving the person 100%.`,
      size: "1024x1024",
      quality: "high",
    });

    const b64 = result.data?.[0]?.b64_json;
    const imageUrl = b64
      ? `data:image/png;base64,${b64}`
      : result.data?.[0]?.url || null;

    return res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    console.error("Generate error:", error.message);
    return res.status(500).json({
      error: error.message,
      code: error.code || "unknown",
    });
  }
}
