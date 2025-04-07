import { v4 as uuidv4 } from "uuid";
import Redis from "ioredis";

const isVercel = process.env.VERCEL === "1";

// Redis 初始化
let redis = null;
if (!isVercel) {
  redis = new Redis(process.env.REDIS_URL, {
    tls: { rejectUnauthorized: false }
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { topic, wordMin, wordMax, paragraphCount, CEFR, style, tone, audience } = req.body;

    if (
      typeof topic !== "string" || !topic.trim() ||
      typeof wordMin !== "number" || isNaN(wordMin) ||
      typeof wordMax !== "number" || isNaN(wordMax) ||
      typeof paragraphCount !== "number" || isNaN(paragraphCount) ||
      typeof CEFR !== "string" || !CEFR.trim()
    ) {
      return res.status(400).json({ error: "缺少必要參數或格式錯誤" });
    }

    const taskId = uuidv4();
    const taskPayload = {
      taskId,
      type: "generate-reading-article",
      payload: { topic, wordMin, wordMax, paragraphCount, CEFR, style, tone, audience },
    };

    if (isVercel) {
      // Vercel 上用 Upstash REST API
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;

      const redisResponse = await fetch(`${url}/lpush/task_queue`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([JSON.stringify(taskPayload)]),
      });

      const result = await redisResponse.json();
      console.log("✅ Redis response (Vercel):", result);
    } else {
      // Local 用 ioredis TCP
      await redis.lpush("task_queue", JSON.stringify(taskPayload));
      console.log("✅ Redis response (Local): 已推入 queue");
    }

    return res.status(200).json({ taskId });
  } catch (error) {
    console.error("❌ start-generate-reading-article 錯誤：", error);
    return res.status(500).json({
      error: "伺服器內部錯誤",
      detail: error.message,
      stack: error.stack,
    });
  }
}
