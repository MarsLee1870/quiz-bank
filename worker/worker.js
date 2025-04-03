// worker.js
import 'dotenv/config';
import Redis from "ioredis";
import { OpenAI } from "openai";

// 🟣 這是 Upstash + Windows + TLS 正確寫法
const redis = new Redis(process.env.REDIS_URL, {
    tls: {
        rejectUnauthorized: false
    }
});

async function processTasks() {
    while (true) {
        const taskData = await redis.brpop("task_queue", 0); // 等待任務
        if (!taskData) continue;

        const task = JSON.parse(taskData[1]);
        const { taskId, type, payload } = task;

        if (type === "generate-reading-article") {
            console.log(`開始處理任務: ${taskId}`);

            const { topic, wordMin, wordMax, paragraphCount, CEFR, style, tone, audience } = payload;

            try {
                const prompt = `
You are an English exam creator.
Please create a complete reading test with:
- Topic: ${topic}
- Word count: around ${wordMin} to ${wordMax} words
- Paragraphs: ${paragraphCount}
- CEFR Level: ${CEFR}
${style ? `- Style: ${style}` : ""}
${tone ? `- Tone: ${tone}` : ""}
${audience ? `- Audience: ${audience}` : ""}

Output format:
Article:
<Your article here>

Questions:
1. <Question text>
(A) Option A
(B) Option B
(C) Option C
(D) Option D
Answer: B

(Repeat for 5 questions)
`.trim();

                const completion = await openai.chat.completions.create({
                    model: "gpt-4-turbo",
                    messages: [{ role: "user", content: prompt }],
                });

                const content = completion.choices[0].message.content.trim();

                // ✅ 存結果
                await redis.set(`task:${taskId}:status`, "done");
                await redis.set(`task:${taskId}:result`, content);

                console.log(`任務完成: ${taskId}`);
            } catch (error) {
                await redis.set(`task:${taskId}:status`, "failed");
                await redis.set(`task:${taskId}:error`, error.message);
                console.error(`任務失敗: ${taskId}`, error);
            }
        }
    }
}

processTasks();
