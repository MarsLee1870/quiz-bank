// quiz-bank/api/reading/get-question-result.js
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, { tls: { rejectUnauthorized: false } });

export default async function handler(req, res) {
    const { taskId } = req.query;

    if (!taskId) return res.status(400).json({ error: "Missing taskId" });

    const status = await redis.get(`task:${taskId}:status`);
    if (!status) {
        return res.json({ status: "not_found" }); // ✅ 改這裡就對了
    }
    
    if (status !== "done") return res.status(200).json({ status });

    const result = await redis.get(`task:${taskId}:result`);
    return res.status(200).json({ status: "done", questions: result });
}
