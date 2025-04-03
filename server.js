// server.js
import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config(); // 讀取 .env

const app = express();
app.use(cors());
app.use(express.json());

// ✅ OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    project: process.env.OPENAI_PROJECT_ID,
});

// ✅ 假的 queue（記憶體）
const articleTasks = {};
const questionTasks = {};

// ------------------------------
// 1️⃣ 文章：POST start-generate-reading-article
// ------------------------------
app.post('/api/reading/start-generate-reading-article', (req, res) => {
    const taskId = "task_" + Math.floor(Math.random() * 100000);
    articleTasks[taskId] = { status: 'pending', input: req.body };
    console.log("✅ 已加入文章生成任務", taskId);
    generateArticle(taskId);
    res.json({ taskId });
});

// ------------------------------
// 2️⃣ 文章：GET get-article-result
// ------------------------------
app.get('/api/reading/get-article-result', (req, res) => {
    const { taskId } = req.query;
    const task = articleTasks[taskId];
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
});

// ------------------------------
// 3️⃣ 題目：POST start-generate-questions
// ------------------------------
app.post('/api/reading/start-generate-questions', (req, res) => {
    const taskId = "task_q_" + Math.floor(Math.random() * 100000);
    questionTasks[taskId] = { status: 'pending', input: req.body };
    console.log("✅ 已加入出題任務", taskId);
    generateQuestions(taskId);
    res.json({ taskId });
});

// ------------------------------
// 4️⃣ 題目：GET get-question-result
// ------------------------------
app.get('/api/reading/get-question-result', (req, res) => {
    const { taskId } = req.query;
    const task = questionTasks[taskId];
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
});

// ------------------------------
// 🟣 真 AI 生成文章
async function generateArticle(taskId) {
    const input = articleTasks[taskId]?.input;
    if (!input) return;

    try {
        const { topic, wordMin, wordMax, paragraphCount, CEFR, style, tone, audience } = input;
        const prompt = `
You are an English writer. Please write a reading passage with the following criteria:
- Topic: ${topic}
- Word count: about ${wordMin} to ${wordMax} words
- Paragraphs: ${paragraphCount}
- CEFR level: ${CEFR}
${style ? `- Style: ${style}` : ""}
${tone ? `- Tone: ${tone}` : ""}
${audience ? `- Target Audience: ${audience}` : ""}
Please only output the passage without explanations.
        `.trim();

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: prompt }],
        });

        articleTasks[taskId] = { status: "done", article: completion.choices[0].message.content.trim() };
        console.log("✅ 文章已完成", taskId);
    } catch (error) {
        console.error("❌ 生成文章錯誤", error);
        articleTasks[taskId] = { status: "error", error: error.message };
    }
}

// ------------------------------
// 🟣 真 AI 生成題目
async function generateQuestions(taskId) {
    const input = questionTasks[taskId]?.input;
    if (!input) return;

    try {
        const { article, questionConfig } = input;

        const typeMap = {
            "主旨型": "Main idea",
            "細節型": "Detail",
            "目的型": "Purpose",
            "架構型": "Structure",
            "釋義型": "Definition",
            "語氣型": "Tone",
            "推論型": "Inference",
        };

        const totalSum = Object.values(questionConfig.types || {})
            .map(n => Number(n) || 0)
            .filter(n => n > 0)
            .reduce((a, b) => a + b, 0);

        const isCustom = Object.values(questionConfig.types || {}).some(n => Number(n) > 0);

        const prompt = `
You are an English reading comprehension test item writer.
Create ${questionConfig.total || 5} multiple-choice questions for this passage:

"""
${article}
"""

Requirements:
1. Use CEFR level consistent with the passage.
2. Number each question.
3. Provide a detailed hint for each question. The hint should explain the correct choice in depth, referencing specific parts of the passage, explaining why the correct answer is right, and possibly providing context or examples from the text to reinforce the reasoning.
4. Each question should be written like the following format:
Question text (on the first line)
(A) Option A
(B) Option B
(C) Option C
(D) Option D
Answer: B
Hint: (Hint in English)

4. Answer and Hint must be on separate lines after the options.
5. Strictly follow the format.

Example:
1. What is the main idea of the passage?
(A) Option A
(B) Option B
(C) Option C
(D) Option D
Answer: B
Hint: Paragraph...mentions...

Do not output anything other than the formatted questions.
`.trim();


        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: prompt }],
        });

        questionTasks[taskId] = { status: "done", questions: completion.choices[0].message.content.trim() };
        console.log("✅ 題目已完成", taskId);
    } catch (error) {
        console.error("❌ 生成題目錯誤", error);
        questionTasks[taskId] = { status: "error", error: error.message };
    }
}

// ------------------------------

app.listen(8787, () => {
    console.log('✅ Local API server is running on http://localhost:8787');
});
