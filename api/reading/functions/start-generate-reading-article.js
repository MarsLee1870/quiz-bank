console.log("✅ API 已進入 start-generate-reading-article.js");

import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

// ⛳️ Redis 初始化（你漏了這一段）
const redis = new Redis(process.env.REDIS_URL, { tls: { rejectUnauthorized: false } });

redis.on("error", (err) => {
    console.error("❌ Redis 連線錯誤：", err);
});

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    try {
        const { topic, wordMin, wordMax, paragraphCount, CEFR, style, tone, audience } = req.body;

        // ✅ 檢查必要欄位
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

        // ✅ 推入 Redis 任務
        await redis.lpush("task_queue", JSON.stringify({
            taskId,
            type: "generate-reading-article",
            payload: { topic, wordMin, wordMax, paragraphCount, CEFR, style, tone, audience }
        }));

        // ✅ 回傳 taskId
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
