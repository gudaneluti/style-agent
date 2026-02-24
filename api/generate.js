import OpenAI from "openai";

export const config = { maxDuration: 120 };

const PROMPT_1 = `FOTO 1/2 — REFERÊNCIA (usar apenas o fundo/cenário)
Esta é a foto de referência. Quero que você use somente o cenário/fundo dela como inspiração (ambiente, cores, estilo, iluminação, profundidade, clima).
Não altere nenhuma pessoa desta foto e não gere a imagem final ainda.
Responda apenas confirmando que entendeu o estilo do fundo e descreva em 3–6 bullets o que você vai replicar.
Em seguida, peça a FOTO 2/2.`;

const PROMPT_2 = `FOTO 2/2 — MINHA FOTO (manter 100% intacta)
Agora esta é a minha foto. Você deve manter EXATAMENTE como está: rosto, corpo, pele, cabelo, roupa, pose, acessórios, expressão e enquadramento — tudo idêntico, sem retocar, sem "embelezar", sem mudar proporções e sem adicionar/remover nada.

Tarefa: trocar APENAS o fundo/cenário para ficar parecido com o da FOTO 1/2.

Regras obrigatórias:
* Não modificar o sujeito (eu) em hipótese alguma.
* Não mudar cores da roupa/pele, nem nitidez do rosto, nem formato do corpo.
* Ajustar somente a iluminação do fundo (e sombras no fundo) para ficar coerente e natural, como se a foto tivesse sido tirada naquele ambiente.
* Manter perspectiva e profundidade (incluindo desfoque, se existir).
* Se houver conflito entre cenário e preservação do meu corpo, priorize 100% preservar meu corpo intacto.

Entrega: gerar a imagem final com o fundo substituído.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { photoBase64, inspoBase64, userApiKey } = req.body;

    if (!photoBase64 || !inspoBase64) {
      return res.status(400).json({ error: "Envie ambas as imagens em base64" });
    }

    // Use user key OR server key
    const apiKey = userApiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: "Nenhuma API key configurada. Cole sua key da OpenAI nas configurações.",
      });
    }

    const openai = new OpenAI({ apiKey });

    // Clean base64 (remove data:image prefix if present)
    const cleanBase64 = (b64) => {
      if (b64.startsWith("data:")) return b64;
      return `data:image/jpeg;base64,${b64}`;
    };

    const inspoUrl = cleanBase64(inspoBase64);
    const photoUrl = cleanBase64(photoBase64);

    // === STEP 1: Analyze inspiration ===
    const step1 = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: inspoUrl } },
            { type: "text", text: PROMPT_1 },
          ],
        },
      ],
    });

    const analysis = step1.choices[0].message.content;

    // === STEP 2: Generate with photo ===
    const step2 = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: inspoUrl } },
            { type: "text", text: PROMPT_1 },
          ],
        },
        { role: "assistant", content: analysis },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: photoUrl } },
            { type: "text", text: PROMPT_2 },
          ],
        },
      ],
    });

    // Extract response
    const step2Message = step2.choices[0].message;
    let resultImageUrl = null;
    let textResponse = "";

    if (Array.isArray(step2Message.content)) {
      for (const part of step2Message.content) {
        if (part.type === "image_url") resultImageUrl = part.image_url.url;
        else if (part.type === "text") textResponse += part.text;
      }
    } else {
      textResponse = step2Message.content || "";
    }

    // If no image from chat, try Images API
    if (!resultImageUrl) {
      try {
        const imgResponse = await openai.images.generate({
          model: "gpt-image-1",
          prompt: `Based on this style analysis of the reference background: ${analysis}

Generate an image that takes the person from the provided photo and places them in a background/scene inspired by the reference photo.

CRITICAL RULES:
- Keep the person EXACTLY as they are: face, body, skin, hair, clothes, pose, accessories, expression, framing — everything identical
- Only change the background/scenery to match the reference style
- Adjust only background lighting and shadows to look natural and coherent
- Maintain perspective and depth of field
- If there's any conflict between scene and person preservation, 100% prioritize preserving the person intact`,
          n: 1,
          size: "1024x1024",
          quality: "high",
        });

        if (imgResponse.data?.[0]?.b64_json) {
          resultImageUrl = `data:image/png;base64,${imgResponse.data[0].b64_json}`;
        } else if (imgResponse.data?.[0]?.url) {
          resultImageUrl = imgResponse.data[0].url;
        }
      } catch (imgErr) {
        console.log("Images API fallback failed:", imgErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      analysis,
      textResponse,
      imageUrl: resultImageUrl,
    });
  } catch (error) {
    console.error("Generate error:", error.message);
    return res.status(500).json({
      error: error.message,
      code: error.code || "unknown",
    });
  }
}
