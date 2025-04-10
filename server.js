// ------------------------------
// ✅ 1. 匯入與設定 .env
// ------------------------------
import dotenv from 'dotenv';
dotenv.config(); // 放最上方！

// ------------------------------
// ✅ 2. 匯入第三方套件
// ------------------------------
import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

// ------------------------------
// ✅ 3. Redis 初始化
// ------------------------------
const redis = new Redis(process.env.REDIS_URL, {
    tls: { rejectUnauthorized: false } // Upstash 專用設定
});
console.log("🔍 redis.url = ", process.env.REDIS_URL);

// ------------------------------
// ✅ 4. Express 初始化
// ------------------------------
const app = express();
app.use(cors());
app.use(express.json());

// ------------------------------
// ✅ 5. OpenAI 初始化
// ------------------------------
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    project: process.env.OPENAI_PROJECT_ID,
});

// ------------------------------
// 🟡 6. 本地記憶體 queue（出題暫時使用）
// ------------------------------
const questionTasks = {};

// ------------------------------
// 1️⃣ 文章：POST start-generate-reading-article
// ------------------------------
app.post('/api/reading/functions/start-generate-reading-article', async (req, res) => {
    try {
        const taskId = "task_" + Math.floor(Math.random() * 100000);
        const task = {
            taskId,
            type: "generate-reading-article",
            payload: req.body,
        };

        await redis.rpush("reading_article_queue", JSON.stringify(task));

        console.log("✅ 任務已送入 Redis queue", taskId);
        res.json({ taskId });
    } catch (err) {
        console.error("❌ Redis 任務推送失敗", err);
        res.status(500).json({ error: "Queue error", detail: err.message });
    }
});

// ------------------------------
// 2️⃣ 文章：GET get-article-result
// ------------------------------
app.get('/api/reading/functions/get-article-result', async (req, res) => {
    const { taskId } = req.query;
    if (!taskId) return res.status(400).json({ error: "Missing taskId" });

    try {
        const status = await redis.get(`task:${taskId}:status`);
        const result = await redis.get(`task:${taskId}:result`);

        if (!status) {
            return res.json({ status: "not_found" }); // ✅ 統一由前端處理
        }

        res.json({ status, article: result });
    } catch (err) {
        console.error("❌ Redis 查詢失敗", err);
        res.status(500).json({ error: "Redis error", detail: err.message });
    }
});

// ------------------------------
// 3️⃣ 題目：POST start-generate-questions（發送到 reading_question_queue）
app.post('/api/reading/functions/start-generate-questions', async (req, res) => {
    try {
        const taskId = "task_q_" + Math.floor(Math.random() * 100000);
        const task = {
            taskId,
            type: "generate-reading-questions",
            payload: req.body,
        };

        await redis.rpush("reading_question_queue", JSON.stringify(task));

        console.log("✅ 題目任務已送入 Redis queue", taskId);
        res.json({ taskId });
    } catch (err) {
        console.error("❌ Redis 任務推送失敗", err);
        res.status(500).json({ error: "Queue error", detail: err.message });
    }
});

// ------------------------------
// 4️⃣ 題目：GET get-question-result
// ------------------------------
app.get('/api/reading/functions/get-question-result', async (req, res) => {
    const { taskId } = req.query;
    if (!taskId) return res.status(400).json({ error: "Missing taskId" });

    try {
        const status = await redis.get(`task:${taskId}:status`);
        const result = await redis.get(`task:${taskId}:result`);

        if (!status) {
            return res.json({ status: "not_found" });
        }

        res.json({ status, questions: result });
    } catch (err) {
        console.error("❌ Redis 查詢失敗", err);
        res.status(500).json({ error: "Redis error", detail: err.message });
    }
});

// ------------------------------
// ✅ 修改後：單字出題任務（Upstash REST 方式）
// ------------------------------
app.post('/api/start-generate-vocab-questions', async (req, res) => {
    try {
        const { words, level, countPerWord, lengthRange } = req.body;

        if (!words || !Array.isArray(words) || !level || !countPerWord || !lengthRange) {
            return res.status(400).json({ error: 'Missing parameters' });
        }

        const taskId = uuidv4();
        const task = {
            taskId,
            type: "generate-vocab-questions",
            payload: { words, level, countPerWord, lengthRange },
        };

        await redis.rpush("vocab_queue", JSON.stringify(task));

        console.log("✅ 單字任務已送入 Redis queue", taskId);
        res.json({ taskId });

    } catch (err) {
        console.error("❌ Redis 任務推送失敗（單字）", err);
        res.status(500).json({ error: "Queue error", detail: err.message });
    }
});


app.get('/api/get-question-result', async (req, res) => {
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

// ------------------------------
// ✅ 啟動 Server
// ------------------------------
app.listen(8787, () => {
    console.log('✅ Local API server is running on http://localhost:8787');
});
