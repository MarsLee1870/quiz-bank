// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { OpenAI } from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    project: process.env.OPENAI_PROJECT_ID,
});

// ====== 產生文章 ======
app.post('/api/reading/generate-reading-article', async (req, res) => {
    try {
        const { topic, wordMin, wordMax, paragraphCount, CEFR, style, tone, audience } = req.body;
        console.log("✅ 收到前端參數：", req.body);

        const prompt = `
You are an English writer. Please write a passage based on the following criteria:
- Topic: ${topic}
- Word Count: Around ${wordMin} to ${wordMax} words
- Paragraphs: ${paragraphCount}
- CEFR Level: ${CEFR}
${style ? `- Style: ${style}` : ""}
${tone ? `- Tone: ${tone}` : ""}
${audience ? `- Audience: ${audience}` : ""}

Please output only the article text.
        `;

        console.log("✅ 實際發送給 OpenAI 的 prompt：", prompt);

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: prompt }],
        });

        res.json({ article: completion.choices[0].message.content.trim() });

    } catch (err) {
        console.error("❌ API 發生錯誤：", err);
        res.status(500).json({ error: "Internal Server Error", detail: err.message });
    }
});

// ====== 產生題目 ======
app.post('/api/reading/generate-questions', async (req, res) => {
    const { article, questionConfig } = req.body;

    const prompt = `請針對文章出題...`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }],
    });

    res.json({ questions: completion.choices[0].message.content.trim() });
});

// ====== Server Start ======
app.listen(5000, () => console.log("API server running on http://localhost:5000"));
