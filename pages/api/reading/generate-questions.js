import { OpenAI } from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    project: process.env.OPENAI_PROJECT_ID,
});

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const { article, questionConfig } = req.body;

    const prompt = `
You are an English test item writer. Based on the following passage, create ${questionConfig.total || 5} multiple-choice reading comprehension questions.

Passage:
"""
${article}
"""

Question types and quantities:
${Object.entries(questionConfig.types || {}).map(([type, count]) => `${type}: ${count} questions`).join("\n")}

Output format:
1. Question + four options labeled (A)(B)(C)(D)
2. Mark the correct answer after each question (e.g., Answer: B)
3. Provide a hint related to the correct answer. The hint should be based on the passage and help explain why the answer is correct (e.g., Hint: The second paragraph mentions that "....")

Do not include any additional explanations beyond the question, answer, and hint.
`.trim();

    const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }],
    });

    res.json({ questions: completion.choices[0].message.content.trim() });
}
