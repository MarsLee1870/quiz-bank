import { v4 as uuidv4 } from 'uuid';
import Redis from "ioredis";

const isVercel = process.env.VERCEL === "1";
let redis = null;

if (!isVercel) {
  redis = new Redis(process.env.REDIS_URL, {
    tls: { rejectUnauthorized: false },
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { words, level, countPerWord, lengthRange } = req.body;

  if (!words || !Array.isArray(words) || !level || !countPerWord || !lengthRange) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const taskId = uuidv4();

  const task = {
    taskId,
    type: "generate-vocab-questions", // 🔥 這個一定要有！
    payload: {
      words,         // [{ word: "train", partOfSpeech: "v." }, ...]
      level,
      countPerWord,
      lengthRange,
    },
  };

  try {
    if (isVercel) {
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;

      const redisResponse = await fetch(`${url}/lpush/vocab_queue`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: JSON.stringify(task)
        }),
      });

      if (!redisResponse.ok) {
        const text = await redisResponse.text();
        console.error("❌ Upstash 錯誤：", text);
        return res.status(500).json({ error: "Failed to enqueue task (Upstash)" });
      }
    } else {
      await redis.lpush("vocab_queue", JSON.stringify(task));
      console.log("✅ Local Redis：已推入 vocab_queue");
    }

    res.status(200).json({ taskId });
  } catch (error) {
    console.error("❌ Enqueue 錯誤：", error);
    res.status(500).json({ error: "Queue error", detail: error.message });
  }
}
