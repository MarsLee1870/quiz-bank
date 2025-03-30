import { OpenAI } from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    project: process.env.OPENAI_PROJECT_ID,
});

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const { topic, wordMin, wordMax, paragraphCount, CEFR, style, tone, audience } = req.body;

    const prompt = `
You are an English writer. Please write a reading passage with the following criteria:
- Topic: ${topic}
- Word count: about ${wordMin} to ${wordMax} words
- Paragraphs: ${paragraphCount}
- CEFR level: ${CEFR}
${style ? `- Style: ${style}` : ""}
${tone ? `- Tone: ${tone}` : ""}
${audience ? `- Target Audience: ${audience}` : ""}
Please only output the passage without explanations.
    `.trim();

    const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }],
    });

    res.json({ article: completion.choices[0].message.content.trim() });
}
