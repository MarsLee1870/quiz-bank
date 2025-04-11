import React, { useState } from "react";
import { generateGPTQuestions } from "@/api/generate-vocab-questions-gpt";

export default function VocabularyAIGenerator() {
  const [inputWords, setInputWords] = useState("");
  const [level, setLevel] = useState("A1");
  const [countPerWord, setCountPerWord] = useState(1);
  const [minWords, setMinWords] = useState(10);
  const [maxWords, setMaxWords] = useState(20);
  const [groupedQuestions, setGroupedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);


  const handleGenerate = async () => {
    setLoading(true);
    setGroupedQuestions([]);
  
    // 驗證題目字數區間
    if (
      minWords < 10 ||
      maxWords > 50 ||
      minWords > maxWords ||
      !Number.isInteger(minWords) ||
      !Number.isInteger(maxWords)
    ) {
      alert("❗ 題目字數必須是 10 到 50 的整數，且最小值不可大於最大值！");
      setLoading(false);
      return;
    }
  
    const wordList = inputWords
      .split("\n")
      .map((w) => w.trim())
      .filter((w) => w.length > 0);
  
    const words = [];
    for (const entry of wordList) {
      const match = entry.match(/^(.+?)\s*\((.+?)\)$/);
      if (!match) {
        console.warn("❌ 格式不符，略過：", entry);
        continue;
      }
      words.push({ word: match[1], partOfSpeech: match[2] });
    }
  
    // ✅ 發送任務
    const res = await fetch(`${import.meta.env.VITE_VOCAB_API_URL}/api/start-generate-vocab-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        words,
        level,
        countPerWord,
        lengthRange: { min: minWords, max: maxWords },
      }),
    });
  
    let taskId;
    try {
      const json = await res.json();
      taskId = json.taskId;
      console.log("📮 任務送出成功，taskId：", taskId);
    } catch (e) {
      const text = await res.text();
      console.error("❌ 回傳內容非 JSON：", text);
      alert("❌ 回傳錯誤，請查看 Console");
      setLoading(false);
      return;
    }
  
    if (!taskId) {
      alert("❌ 無法送出任務");
      setLoading(false);
      return;
    }
  
    // ✅ polling 拿結果
    let tries = 0;
    let maxTries = 30;
    while (tries < maxTries) {
      const pollRes = await fetch(`${import.meta.env.VITE_VOCAB_API_URL}/api/get-question-result?taskId=${taskId}`);
      if (pollRes.status === 200) {
        try {
          const resultJson = await pollRes.json();
          if (resultJson.status === "done") {
            setGroupedQuestions(resultJson.data);
            break;
          }
        } catch (e) {
          const text = await pollRes.text();
          console.error("❌ polling 回傳錯誤：", text);
        }
      }
  
      await new Promise((resolve) => setTimeout(resolve, 1000));
      tries++;
    }
  
    if (tries === maxTries) {
      alert("❌ 生成超時，請稍後再試！");
    }
  
    setLoading(false);
  };
  
 

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 標題 */}
      <h1 className="text-4xl font-bold text-center mb-8">AI 單字選擇題</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[4fr_7fr] gap-8">
        {/* 左側輸入區 */}
        <div>
          <label className="block mb-2 text-2xl font-semibold">
            輸入單字（<span className="text-gray-400">一行一個單字</span>）
          </label>
          <textarea
            className="w-full h-48 bg-gray-900 text-gray-100 placeholder-gray-400 border border-gray-600 p-4 rounded resize-none shadow"
            placeholder={"例：\ngenerate (v.)\nlanguage (n.)"}
            value={inputWords}
            onChange={(e) => setInputWords(e.target.value)}
          />

          {/* 設定區塊 */}
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div>
              <label className="block mb-1 font-semibold text-gray-100 text-xl">CEFR</label>
              <select
                className="bg-gray-900 text-gray-100 border border-gray-600 px-2 py-1 rounded w-full text-center"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-100 text-xl">每個單字題數</label>
              <input
                type="number"
                min={1}
                max={3}
                className="bg-gray-900 text-gray-100 border border-gray-600 px-2 py-1 rounded w-full text-center"
                value={countPerWord}
                onChange={(e) => setCountPerWord(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-xl">題目字數</label>
              <div className="flex items-center justify-center gap-1">
                <input
                  type="number"
                  min={10}
                  max={50}
                  className="bg-gray-900 text-gray-100 border border-gray-600 px-2 py-1 rounded w-16 text-center"
                  value={minWords}
                  onChange={(e) => setMinWords(Number(e.target.value))}
                />
                <span className="mx-0">~</span>
                <input
                  type="number"
                  min={10}
                  max={50}
                  className="bg-gray-900 text-gray-100 border border-gray-600 px-2 py-1 rounded w-16 text-center"
                  value={maxWords}
                  onChange={(e) => setMaxWords(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <button
  className={`mt-6 w-full text-xl px-5 py-2 rounded shadow text-white transition ${
    loading
      ? "bg-blue-400 animate-pulse cursor-not-allowed"
      : "bg-blue-500 hover:bg-blue-600"
  }`}
  onClick={handleGenerate}
  disabled={loading}
>
  {loading ? "生成中..." : "出題"}
</button>

        </div>

        {/* 右側題目展示區 */}
        <div className="h-[600px] overflow-y-auto pr-2 space-y-8 border-l pl-6">
        {Array.isArray(groupedQuestions) &&
  groupedQuestions.map((group, idx) => (
    <div key={idx}>
      <h2 className="text-xl font-bold mb-3">
        {group.word} ({group.partOfSpeech})
      </h2>
      {group.questions.map((q, i) => (
        <div
          key={i}
          className="border border-gray-600 bg-gray-900 text-gray-100 rounded p-4 mb-3 shadow"
        >
          <div>{i + 1}. ( {q.answerLetter} ) {q.question}</div>
          <div className="pl-6 flex gap-6 flex-wrap text-gray-300 text-x1">
            {q.options.map((opt, idx) => (
              <span key={idx}>({String.fromCharCode(65 + idx)}) {opt}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
))}

        </div>
      </div>
    </div>
  );
}
