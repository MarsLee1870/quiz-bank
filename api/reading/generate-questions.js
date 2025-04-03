// pages/api/reading/generate-questions.js

import { OpenAI } from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    project: process.env.OPENAI_PROJECT_ID,
});

// 題型中英對照
const typeMap = {
    "主旨型": "Main idea",
    "細節型": "Detail",
    "目的型": "Purpose",
    "架構型": "Structure",
    "釋義型": "Definition",
    "語氣型": "Tone",
    "推論型": "Inference",
};

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    try {
        const { article, questionConfig } = req.body;
        
        if (!article || !questionConfig) {
            return res.status(400).json({ error: "Missing article or questionConfig" });
        }
        
        const totalSum = Object.values(questionConfig.types || {})
    .map(n => Number(n) || 0)
    .filter(n => n > 0)
    .reduce((a, b) => a + b, 0);

        // 判斷是否有填題型分配（有填就是自訂，沒填就是AI自由分配）
        const isCustom = Object.values(questionConfig.types || {}).some(n => Number(n) > 0);

        // ------ prompt ------
        const prompt = `
You are an English reading comprehension test item writer.
Create ${questionConfig.total || 5} multiple-choice questions for this passage:
The difficulty of the questions should be consistent with the CEFR level of the passage.
Passage:
"""
${article}
"""
${isCustom
    ? `Use this question type distribution:
${Object.entries(questionConfig.types).filter(([_, count]) => count > 0).map(([type, count]) => `${typeMap[type] || type}: ${count} question(s)`).join("\n")}`
    : `Decide question types freely, ensure variety.`}

Format:
1. Number each question.
2. Each question should have 4 options (A)(B)(C)(D), each option should be on a new line.
3. After each question, mark the correct answer. Format exactly as: Answer: B
4. After the answer, provide a hint based on the passage to explain the correct choice. Format exactly as: Hint: ...

Notes:
- Do not exceed ${totalSum  || 5} questions.
- Avoid including any explanations beyond the required questions, answers, and hints.
- The options should be reasonable distractors related to the passage.

Output Example:
1. (A)(B)(C)(D) Question...
Answer: B
Hint: ...
`.trim();

        // 呼叫 OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: prompt }],
        });

        const output = completion.choices[0]?.message?.content?.trim();

        if (!output) {
            return res.status(500).json({ error: "No response from AI" });
        }

        return res.status(200).json({ questions: output });

    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ error: "API Error", details: error.message });
    }
}
