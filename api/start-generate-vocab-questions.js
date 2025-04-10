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
    const { words, level, countPerWord, lengthRange } = req.body;

    if (
      !Array.isArray(words) || words.length === 0 ||
      typeof level !== "string" || !level.trim() ||
      typeof countPerWord !== "number" || isNaN(countPerWord) ||
      !lengthRange || typeof lengthRange.min !== "number" || typeof lengthRange.max !== "number"
    ) {
      return res.status(400).json({ error: "缺少必要參數或格式錯誤" });
    }

    const taskId = uuidv4();
    const taskPayload = {
      taskId,
      type: "generate-vocab-questions",
      payload: { words, level, countPerWord, lengthRange },
    };

    if (isVercel) {
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    
      console.log("🚀 Redis REST URL:", url);
      console.log("🔑 Redis REST TOKEN:", token);
      console.log("📦 Redis payload:", taskPayload);
    
      const redisResponse = await fetch(`${url}/lpush/vocab_queue`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: JSON.stringify(taskPayload)
        }),
      });
      
      const text = await redisResponse.text();
      console.log("📡 Status Code:", redisResponse.status);
      console.log("📄 Raw Response Text:", text);
      
      if (!redisResponse.ok) {
        throw new Error(`Upstash Redis API error: ${redisResponse.status} - ${text}`);
      }

    } else {
      await redis.lpush("vocab_queue", JSON.stringify(taskPayload));
      console.log("✅ Redis response (Local): 已推入 vocab_queue");
    }

    return res.status(200).json({ taskId });
  } catch (error) {
    console.error("❌ start-generate-vocab-questions 錯誤：", error);
    console.error("🔍 error.message:", error.message);
    console.error("📄 error.stack:", error.stack);

    return res.status(500).json({
      error: "伺服器內部錯誤",
      detail: error.message,
      stack: error.stack,
    });
  }
}
