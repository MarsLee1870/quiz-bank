// generate-vocab-questions-gpt.js

export async function generateGPTQuestions({
  word,             // 單字，例如："wait"
  partOfSpeech,     // 詞性，例如："v-ing"
  level,            // CEFR 等級，例如："A2"
  lengthRange       // 題目字數範圍，例如："10-14"
}) {
  try {
    // 改為相對路徑，讓 local 與 vercel 都能正常運作
    const apiUrl = '/api/openai/vocab-question';
    console.log('Calling API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        word,
        partOfSpeech,
        level,
        lengthRange
      })
    });

    if (!response.ok) {
      throw new Error("API 回傳失敗");
    }

    const data = await response.json();

    // 預期格式：{ question, options, answer }
    if (!data.question || !data.options || !data.answer) {
      throw new Error("回傳格式錯誤，缺少必要欄位");
    }

    return data;
  } catch (error) {
    console.error("❌ generateGPTQuestions 錯誤:", error);
    return null;
  }
}
