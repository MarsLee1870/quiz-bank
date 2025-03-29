// ✅ 最終版 /api/openai/vocab-question.js
// 符合所有需求：正確格式解析、容錯強、支援 Vercel production

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed.' });
  }

  const { word, partOfSpeech, level, lengthRange } = req.body;

  if (!word || !partOfSpeech || !lengthRange?.min || !lengthRange?.max) {
    return res.status(400).json({
      error: 'Missing required parameters: word, partOfSpeech, lengthRange',
    });
  }

  const prompt = `
You are an experienced English test item writer.

Your task is to create one multiple-choice vocabulary question (MCQ) for English learners following these rules:

[Requirements]
1. The correct answer is a ${partOfSpeech}, and the intended answer is the word "${word}". However, DO NOT mention or display this word anywhere in the question.
2. Write a complete, natural, and meaningful English sentence with ONE blank (_____).
3. The sentence should use vocabulary and grammar suitable for ${level} level learners, based on CEFR and commonly used wordlists (NGSL, Cambridge, COCA). Avoid rare, uncommon, or difficult words unless they are acceptable for ${level}.
4. The sentence length must be between ${lengthRange.min} and ${lengthRange.max} words. Feel free to adjust subject, time, place, or context naturally.
5. The question must contain exactly 4 answer choices:
   (A), (B), (C), and (D).
6. All choices must be the same part of speech (${partOfSpeech}).
7. Three distractors should be grammatically correct but semantically incorrect or less suitable in the sentence.
8. Randomly assign the correct answer to one of (A)~(D).

[Output Format] (IMPORTANT)
Output MUST be in the following JSON format without any extra explanation:

{
  "question": "The sentence with a blank (_____)",
  "choices": ["choice A", "choice B", "choice C", "choice D"],
  "answer": "B"
}

[Notes]
- DO NOT add explanations, translations, comments, or extra text.
- DO NOT output anything except the valid JSON.

Example:
{
  "question": "I was _____ for my mom after school.",
  "choices": ["kicking", "waiting", "facing", "swimming"],
  "answer": "B"
}
`;

try {
  let finalQuestion = null;
  let attempts = 0;
  const maxAttempts = 3;

  while (!finalQuestion && attempts < maxAttempts) {
      attempts++;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
              "OpenAI-Project": process.env.OPENAI_PROJECT_ID,
          },
          body: JSON.stringify({
              model: "gpt-4-turbo",
              messages: [{ role: "user", content: prompt }],
          }),
      });

      const data = await response.json();

      if (!response.ok) {
          console.error(`❌ OpenAI API error (attempt ${attempts}):`, data);
          continue;
      }

      const output = data.choices[0]?.message?.content?.trim();
      if (!output) {
          console.warn(`❌ Empty response (attempt ${attempts})`);
          continue;
      }

      console.log(`✅ AI 原始輸出（第 ${attempts} 次）:`, output);

      const lines = output.split("\n").map(line => line.trim()).filter(Boolean);

      // ✅ 嚴格檢查答案格式
      const answerLine = lines[0];
      const match = answerLine.match(/^1\.\s*\(\s*([A-D])\s*\)\s*(.+)$/);

      if (!match) {
          console.warn(`⚠️ 格式錯誤（第 ${attempts} 次）: 無法解析答案行`, answerLine);
          continue;
      }

      const answerLetter = match[1];
      const questionLine = match[2].trim(); 
// 移除可能出現在開頭的 ( word ) 類型誤標記

      // ✅ 強制只能是 A~D
      if (!["A", "B", "C", "D"].includes(answerLetter)) {
          console.warn(`⚠️ 非法答案（第 ${attempts} 次）: ${answerLetter}`);
          continue;
      }

      // ✅ 解析選項
      const optionText = lines.slice(1).join(" ");
      const optionMatches = [...optionText.matchAll(/\(([A-D])\)\s*([^\(]+)/g)];

      if (optionMatches.length !== 4) {
          console.warn(`⚠️ 格式錯誤（第 ${attempts} 次）: 選項不足 4 個`, optionText);
          continue;
      }
      const options = optionMatches.map(m => m[2].trim());

      finalQuestion = {
          question: questionLine,
          options,
          answer: answerLetter,
      };
  }

  // ✅ 三次都失敗才回 error
  if (!finalQuestion) {
      console.error("❌ All attempts failed. No valid question generated.");
      return res.status(500).json({
          error: `Failed to generate a valid question after ${maxAttempts} attempts.`,
      });
  }

  // ✅ 回傳成功的題目
  res.status(200).json(finalQuestion);

} catch (error) {
  console.error("❌ API error:", error);
  res.status(500).json({
      error: error?.message || "Failed to generate question from OpenAI.",
  });
}
}
