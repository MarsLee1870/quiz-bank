// pages/api/openai/vocab-question.js

export default async function handler(req, res) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
    }

    res.status(200).json({ message: '✅ API 正常運作！已成功讀取 OPENAI_API_KEY！' });
}
