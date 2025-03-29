// pages/api/openai/vocab-question.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1', // ✅ 新版 SDK 必加
});

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

  // ✨ 英文版 Prompt，內含語意干擾限制
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

1. ( B )
I was _____ for my mom after school.
(A) kicking (B) waiting (C) facing (D) swimming

[Notes]
- Do not explain anything.
- Do not include translations.
- Output only the formatted question.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const output = completion.choices[0].message.content.trim();
    console.log('✅ AI 原始輸出:', output);

    // 處理格式：答案、題目、選項
    const lines = output.split('\n').map(line => line.trim()).filter(Boolean);
    const answerLine = lines[0];
    const questionLine = lines[1];
    const optionLines = lines.slice(2);

    const answerLetter = answerLine.match(/\(\s*([A-D])\s*\)/)?.[1];
    const options = optionLines.map(line => {
      const match = line.match(/\([A-D]\)\s*(.+)/);
      return match ? match[1].trim() : '';
    });

    if (!answerLetter || options.length !== 4) {
      return res.status(500).json({ error: 'Invalid format returned by OpenAI.' });
    }

    res.status(200).json({
      question: questionLine,
      options: options,    // 保留原始 A~D 選項順序
      answer: answerLetter // 回傳正確答案位
    });

  } catch (error) {
    console.error('❌ API error:', error);

    // ✅ 傳回錯誤訊息給前端（更好 debug）
    res.status(500).json({
      error: error?.message || 'Failed to generate question from OpenAI.'
    });
  }
}
