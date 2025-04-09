app.get('/api/vocab/functions/get-question-result', async (req, res) => {
    const { taskId } = req.query;
    if (!taskId) return res.status(400).json({ error: "Missing taskId" });
  
    const isVercel = process.env.VERCEL === "1";
  
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
  
      res.json({ status, data: JSON.parse(result) });
    } catch (err) {
      console.error("❌ Redis 查詢失敗（單字）", err);
      res.status(500).json({ error: "Redis error", detail: err.message });
    }
  });
  