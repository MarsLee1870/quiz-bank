// quiz-bank/api/reading/start-generate-questions.js
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

const redis = new Redis(process.env.REDIS_URL, { tls: { rejectUnauthorized: false } });

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const { article, questionConfig } = req.body;

    if (!article || !questionConfig) {
        return res.status(400).json({ error: "Missing article or questionConfig" });
    }

    const taskId = uuidv4();

    await redis.lpush("task_queue", JSON.stringify({
        taskId,
        type: "generate-reading-questions",
        payload: { article, questionConfig }
    }));

    return res.status(200).json({ taskId });
}
