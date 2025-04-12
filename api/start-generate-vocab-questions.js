import { v4 as uuidv4 } from "uuid";
import Redis from "ioredis";

const isVercel = process.env.VERCEL === "1";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // ✅ 每次 request 都建立一個新 Redis 實例
  const redis = new Redis(process.env.REDIS_URL, {
    tls: { rejectUnauthorized: false },
     });

  redis.on("error", (err) => {
    console.error("❌ Redis 連線錯誤：", err);
  });

  redis.on("end", () => {
    console.warn("⚠️ Redis 連線已中斷");
  });

  redis.on("reconnecting", () => {
    console.log("🔁 Redis 嘗試重新連線...");
  });

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

    await redis.lpush("vocab_queue", JSON.stringify(taskPayload));
    const qLen = await redis.llen("vocab_queue");
    console.log("📦 vocab_queue 長度 =", qLen);
    console.log("📮 任務送出成功，taskId：", taskId);

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
  } finally {
    if (!isVercel) await redis.quit();
    else redis.quit();
}
}
