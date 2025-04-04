// ✅ 最終版 /api/openai/vocab-question.js
// 符合所有需求：正確格式解析、容錯強、支援 Vercel production

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed.' });
  }

  const { word, partOfSpeech, level, lengthRange } = req.body;

  if (!word || !partOfSpeech || lengthRange?.min == null || lengthRange?.max == null) {
    return res.status(400).json({
      error: 'Missing required parameters: word, partOfSpeech, lengthRange',
    });
  }

  const prompt = `
You are an experienced English test item writer.

Your task is to create one multiple-choice vocabulary question (MCQ) for English learners following these rules:

[Requirements]
1. Make an English sentence with the word "${word}" based a various topics and then replace it with ONE blank (_____).
2. The sentence should use vocabulary and grammar suitable for ${level} level learners, based on CEFR and commonly used wordlists (NGSL, Cambridge, COCA). Avoid rare, uncommon, or difficult words unless they are acceptable for ${level}.
3. The sentence length must be between ${lengthRange.min} and ${lengthRange.max} words. Feel free to adjust subject, time, place, or context naturally.
4. The question must contain exactly 4 answer choices:
   (A), (B), (C), and (D).
5. All choices must be the same part of speech (${partOfSpeech}).
6. The three choices except the answer should be grammatically correct but semantically incorrect or less suitable in the sentence.
7. Randomly assign the correct answer to one of (A)~(D).
8. Check the structure and grammar of the sentence and make sure it is correct.

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
console.log(`✅ AI 原始輸出（第 ${attempts} 次）:`, output);

try {
    const json = JSON.parse(output);

    if (!json.question || !json.choices || !json.answer) {
        console.warn(`⚠️ 格式錯誤：缺少欄位`, json);
        continue;
    }

    finalQuestion = {
        question: json.question.trim(),
        options: json.choices.map(opt =>
            opt.trim().replace(/[.,!?;:"'()、。！？：；「」]/g, "")
        ),
        answer: json.answer.trim(), // "A", "B", "C" or "D"
    };

} catch (err) {
    console.warn(`❌ JSON 解析失敗：`, err);
    continue;
}

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
