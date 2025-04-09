app.get('/api/vocab/functions/get-question-result', async (req, res) => {
    const { taskId } = req.query;
    if (!taskId) return res.status(400).json({ error: "Missing taskId" });
  
    try {
        const status = await redis.get(`task:${taskId}:status`);
        const result = await redis.get(`task:${taskId}:result`);
  
        if (!status) {
            return res.json({ status: "not_found" });
        }
  
        res.json({ status, data: JSON.parse(result) });
    } catch (err) {
        console.error("❌ Redis 查詢失敗（單字）", err);
        res.status(500).json({ error: "Redis error", detail: err.message });
    }
  });
  