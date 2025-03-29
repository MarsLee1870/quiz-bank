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
You are an English test item writer.

Generate one vocabulary multiple-choice question following these rules:

[Rules]
1. The question must be a complete English sentence with one blank (_____).
2. The target word is: "${word}" (${partOfSpeech}).
3. Sentence length must be between ${lengthRange.min} and ${lengthRange.max} words, change the subject, time, place if necessary.
4. The target word must appear only once, in the most natural position.
5. You must generate exactly four options: (A), (B), (C), and (D).
6. All options must have the same part of speech and form as the target word.
7. Three distractors must be grammatically correct but semantically incorrect or illogical when placed in the sentence.
8. Output format must be exactly like this:

1. ( B ) I was _____ for my mom after school.
         (A) kicking (B) waiting (C) facing (D) swimming

[Notes]
- Do not explain anything.
- Do not include translations.
- Output only the formatted question.
- Answer must be marked using the correct letter (A/B/C/D), not the word itself.
`;

  try {
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
      console.error("❌ OpenAI API error:", data);
      return res.status(500).json({ error: data?.error?.message || 'OpenAI API failed.' });
    }

    const output = data.choices[0]?.message?.content?.trim();
    if (!output) return res.status(500).json({ error: "Empty response from OpenAI" });

    console.log("✅ AI 原始輸出:", output);

    const lines = output.split("\n").map(line => line.trim()).filter(Boolean);

    const answerLine = lines[0];
    const match = answerLine.match(/^1\.\s*\(\s*([A-D])\s*\)\s*(.+)$/);
    if (!match) {
      return res.status(500).json({ error: "Invalid format: answer line parsing failed." });
    }

    const answerLetter = match[1];
    const questionLine = match[2];

    // 將所有行合成一行處理選項
const optionText = lines.slice(1).join(' '); 

const optionMatches = [...optionText.matchAll(/\([A-D]\)\s*([^)]+)/g)];

const options = optionMatches.map(m => m[1].trim());

if (optionMatches.length !== 4) {
    return res.status(500).json({ error: "選項數量錯誤，請檢查 AI 輸出", raw: optionText });
}


    if (!answerLetter || options.length !== 4) {
      return res.status(500).json({ error: "Invalid format returned by OpenAI.", raw: { answerLine, options } });
    }

    res.status(200).json({
      question: questionLine,
      options: options,
      answer: answerLetter,
    });

  } catch (error) {
    console.error("❌ API error:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate question from OpenAI.",
    });
  }
}
