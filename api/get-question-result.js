import Redis from "ioredis";

let redis = null;
const isVercel = process.env.VERCEL === "1";

if (!redis) {
  redis = new Redis(process.env.REDIS_URL, {
    tls: { rejectUnauthorized: false }
  });
}

export default async function handler(req, res) {
  const { taskId } = req.query;
  if (!taskId) return res.status(400).json({ error: "Missing taskId" });

  try {
    let status, result;

    // ✅ 無論 Vercel 或 local，都統一使用 ioredis
    status = await redis.get(`task:${taskId}:status`);
    result = await redis.get(`task:${taskId}:result`);
    console.log("🔎 Redis 查詢結果", { taskId, status, result });

    if (!status) {
      return res.json({ status: "not_found" });
    }

    if (status === "done" && (!result || result === "")) {
      return res.json({ status: "not_ready" });
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
    } catch (e) {
      console.error("❌ JSON parse 失敗：", result);
      return res.status(500).json({ status, error: "結果格式錯誤" });
    }

    res.setHeader("Cache-Control", "no-store");
    res.json({ status, data: parsedResult });

  } catch (err) {
    console.error("❌ Redis 查詢失敗（單字）", err);
    res.status(500).json({ error: "Redis error", detail: err.message });
  }
}
