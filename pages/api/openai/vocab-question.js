// pages/api/openai/vocab-question.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 讀取環境變數
    const apiKey = process.env.OPENAI_API_KEY;
    const projectId = process.env.OPENAI_PROJECT_ID;
    const assistantId = process.env.OPENAI_ASSISTANT_ID;

    if (!apiKey || !projectId || !assistantId) {
        return res.status(500).json({ error: '❌ 缺少 OPENAI API 環境變數，請確認 Vercel 有設好' });
    }

    // 取得前端傳來的資料
    const { word, partOfSpeech, level, lengthRange } = req.body;

    // 檢查資料
    if (!word || !partOfSpeech || !level || !lengthRange) {
        return res.status(400).json({ error: '❌ 缺少必要參數' });
    }

    try {
        // 呼叫 OpenAI API (Chat Completions)
        const openaiResponse = await fetch(`https://api.openai.com/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Project': projectId // 有些人會用，但其實一般不用加
            },
            body: JSON.stringify({
                model: "gpt-4-turbo", // 或 gpt-3.5-turbo
                messages: [
                    {
                        role: "system",
                        content: "你是一位專業的英語出題老師，請依照指定的單字、詞性、難度和題目長度，出一道單字選擇題，選項四個，並提供正確答案"
                    },
                    {
                        role: "user",
                        content: `單字: ${word}\n詞性: ${partOfSpeech}\nCEFR: ${level}\n題目長度: ${lengthRange}個單字`
                    }
                ],
                temperature: 0.7
            })
        });

        const data = await openaiResponse.json();

        if (!data.choices || !data.choices[0]?.message?.content) {
            return res.status(500).json({ error: 'OpenAI 回應格式錯誤', detail: data });
        }

        // 解析 OpenAI 傳回的文字
        const text = data.choices[0].message.content;

        // 假設 AI 回你像下面這樣（你之後可以調 prompt 讓 AI 固定格式）
        // Question: What does "generate" mean?
        // Options: A. Create, B. Delete, C. Organize, D. Cancel
        // Answer: A

        const match = text.match(/Question:(.*?)Options:(.*?)Answer:(.*)/s);
        if (!match) {
            return res.status(500).json({ error: '❌ 無法解析 OpenAI 回應，請調整 prompt' });
        }

        const question = match[1].trim();
        const optionsRaw = match[2].trim().split(/,\s*/);
        const options = optionsRaw.map(opt => opt.replace(/^[A-D]\.\s*/, '').trim());
        const answerLetter = match[3].trim();

        const answerIndex = "ABCD".indexOf(answerLetter);
        const answer = options[answerIndex];

        res.status(200).json({ question, options, answer });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: '❌ 伺服器錯誤', detail: error.message });
    }
}
