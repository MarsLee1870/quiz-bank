import Redis from "ioredis";

let redis = null;
const isVercel = process.env.VERCEL === "1";

if (!isVercel) {
  redis = new Redis(process.env.REDIS_URL, {
    tls: { rejectUnauthorized: false }
  });
}

export default async function handler(req, res) {
  const { taskId } = req.query;
  if (!taskId) return res.status(400).json({ error: "Missing taskId" });

  try {
    let status, result;

    if (isVercel) {
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;

      const statusRes = await fetch(`${url}/get/task:${taskId}:status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      status = await statusRes.text();

      const resultRes = await fetch(`${url}/get/task:${taskId}:result`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      result = await resultRes.text();

    } else {
      status = await redis.get(`task:${taskId}:status`);
      result = await redis.get(`task:${taskId}:result`);
    }

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

    res.json({ status, data: parsedResult });

  } catch (err) {
    console.error("❌ Redis 查詢失敗（單字）", err);
    res.status(500).json({ error: "Redis error", detail: err.message });
  }
}
