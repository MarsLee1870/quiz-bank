const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_PROJECT_ID = import.meta.env.VITE_OPENAI_PROJECT_ID;

if (!OPENAI_API_KEY || !OPENAI_PROJECT_ID) {
  throw new Error("❌ 請確認 .env 中設有 VITE_OPENAI_API_KEY 與 VITE_OPENAI_PROJECT_ID");
}

export async function generateQuestions({ words, cefrLevel, minWords, maxWords, questionsPerWord }) {
  if (!Array.isArray(words) || words.length === 0) {
    console.error("❌ Words list is empty or not an array:", words);
    return [];
  }

  if (!cefrLevel || !minWords || !maxWords || !questionsPerWord) {
    console.error("❌ Missing required parameters:", { cefrLevel, minWords, maxWords, questionsPerWord });
    return [];
  }

  const vocabList = words.map(w => `${w.word} (${w.partOfSpeech}): ${w.meaning}`).join("\n");

  const systemPrompt = `
You are an English test maker.

You will receive a list of vocabulary words from the user. Each word comes with its part of speech and meaning.

For each word:
- Create ${questionsPerWord} multiple-choice questions.
- Each question must be a complete sentence with a blank (_____) where the target word should appear.
- Each question must contain exactly 4 options (correct word + 3 distractors).
- All options must be the same part of speech.
- Sentence length must be between ${minWords} and ${maxWords} words.
- Questions must match CEFR level: ${cefrLevel}.
- Use the meaning to ensure sentence relevance and accuracy.
- Questions should be realistic and varied, not generic.
- Do not repeat template phrases like “This is an _____ of good writing.”

Return ONLY a valid JSON array like this:
[
  {
    "word": "train",
    "question": "She waited at the station for the _____ to arrive.",
    "options": ["train", "bus", "car", "plane"],
    "answer": "train"
  }
]

Do not include explanations. Return JSON only.
`;

  const userPrompt = `Vocabulary list:\n${vocabList}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Project": OPENAI_PROJECT_ID
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt.trim() },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    // ✅ 修正位置的錯誤處理
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ OpenAI 回傳錯誤內容：", errorText);
      throw new Error(`OpenAI 回傳錯誤 (${res.status})`);
    }

    const data = await res.json();

    const messageContent = data?.choices?.[0]?.message?.content || "";
    console.log("📩 GPT 回傳內容：", messageContent);

    const jsonMatch = messageContent.match(/\[\s*{[\s\S]*?}\s*\]/);
    if (!jsonMatch) throw new Error("回傳的內容不符合 JSON 格式");

    const jsonArray = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(jsonArray)) throw new Error("GPT 回傳的不是有效的 JSON 陣列");

    return jsonArray;
  } catch (err) {
    console.error("❌ GPT 出題錯誤：", err);
    return [];
  }
}
