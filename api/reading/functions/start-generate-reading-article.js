// quiz-bank/api/reading/start-generate-reading-article.js
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

const redis = new Redis(process.env.REDIS_URL, { tls: { rejectUnauthorized: false } });

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const { topic, wordMin, wordMax, paragraphCount, CEFR, style, tone, audience } = req.body;

    if (!topic || !wordMin || !wordMax || !paragraphCount || !CEFR) {
        return res.status(400).json({ error: "Missing required parameters." });
    }

    const taskId = uuidv4();

    await redis.lpush("task_queue", JSON.stringify({
        taskId,
        type: "generate-reading-article",
        payload: { topic, wordMin, wordMax, paragraphCount, CEFR, style, tone, audience }
    }));

    return res.status(200).json({ taskId });
}
