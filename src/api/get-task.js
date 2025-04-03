import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export default async function handler(req, res) {
    const { taskId } = req.query;
    if (!taskId) return res.status(400).send("Missing taskId");

    const status = await redis.get(`task:${taskId}:status`);
    const result = await redis.get(`task:${taskId}:result`);

    res.json({ status, result });
}
