import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL); // REDIS_URL 記得放到 .env

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const { input } = req.body;
    const taskId = "task_" + Date.now();

    await redis.lpush("task_queue", JSON.stringify({ taskId, input }));
    await redis.set(`task:${taskId}:status`, "pending");

    res.json({ taskId });
}
