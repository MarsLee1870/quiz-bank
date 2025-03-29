export async function generateGPTQuestions({
  word,
  partOfSpeech,
  level,
  lengthRange
}) {
  try {
    const apiUrl = `${window.location.origin}/api/openai/vocab-question`;
    console.log('Calling API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ word, partOfSpeech, level, lengthRange })
    });

    if (!response.ok) {
      throw new Error("API 回傳失敗");
    }

    const data = await response.json();

    if (!data.question || !data.options || !data.answer) {
      throw new Error("回傳格式錯誤，缺少必要欄位");
    }

    return data;
  } catch (error) {
    console.error("❌ generateGPTQuestions 錯誤:", error);
    return null;
  }
}
