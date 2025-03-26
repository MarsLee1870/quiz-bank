// VocabularyAIGenerator.jsx
import React, { useState } from "react";
import { generateGPTQuestions } from "@/api/generate-vocab-questions-gpt";

export default function VocabularyAIGenerator() {
  const [inputWords, setInputWords] = useState("");
  const [level, setLevel] = useState("A1");
  const [countPerWord, setCountPerWord] = useState(1);
  const [minWords, setMinWords] = useState(10);
  const [maxWords, setMaxWords] = useState(20);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    console.log("✅ 出題按鈕被點擊！");
    setLoading(true);
    setQuestions([]);
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

    const allQuestions = [];

    for (const entry of wordList) {
      const match = entry.match(/^(.+?)\s*\((.+?)\)/);
      if (!match) {
        console.warn("❌ 格式不符，略過：", entry);
        continue;
      }

      const word = match[1];
      const partOfSpeech = match[2];
      console.log("🚀 準備出題：", word, partOfSpeech);

      for (let i = 0; i < countPerWord; i++) {
        console.log("📮 呼叫 generateGPTQuestions 中...");
        const result = await generateGPTQuestions({
          word,
          partOfSpeech,
          level,
          lengthRange: `${minWords}-${maxWords}`,
        });

        console.log("📬 GPT 回傳結果：", result);

        if (result) {
          const { question, options, answer } = result;
          const labels = ["A", "B", "C", "D"];
          const shuffled = [...options].sort(() => Math.random() - 0.5);
          const correctIndex = shuffled.findIndex((o) => o === answer);

          allQuestions.push({
            displayLine1: `( ${labels[correctIndex]} ) ${question}`,
            displayLine2: shuffled
              .map((opt, i) => `(${labels[i]}) ${opt}`)
              .join("     "),
          });
        }
      }
    }

    setQuestions(allQuestions);
    setLoading(false);
  };

  const numberOptions = Array.from({ length: 41 }, (_, i) => 10 + i);

  return (
    <div className="p-4 relative">
      {/* 固定上方按鈕區 */}
      <button className="fixed top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded z-10">
        返回上一頁
      </button>
      <button className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded z-10">
        匯出word
      </button>

      {/* 標題 */}
      <h1 className="text-4xl font-bold text-center my-12">AI 單字選擇題</h1>

      <div className="grid grid-cols-2 gap-8">
        {/* 左側輸入框 */}
        <div>
          <label className="block mb-2 text-lg">輸入單字（<span className="text-gray-600">一行一個單字</span>）</label>
          <textarea
            className="w-full border rounded p-2 h-64 resize-none overflow-y-auto"
            placeholder={"例：\ngenerate (v.) \nlanguage (n.) "}
            value={inputWords}
            onChange={(e) => setInputWords(e.target.value)}
          />
        </div>

        {/* 右側設定欄 */}
        <div className="space-y-4">
          <div>
            <label className="block mb-1">CEFR 等級</label>
            <select
              className="w-full border rounded p-2"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              {['A1','A2','B1','B2','C1','C2'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">每個單字題數</label>
            <select
              className="w-full border rounded p-2"
              value={countPerWord}
              onChange={(e) => setCountPerWord(Number(e.target.value))}
            >
              {[1, 2, 3].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
          <label className="block mb-1">題目字數 (10~50字)</label>
<div className="flex items-center gap-2">
  <input
    className="w-full border rounded p-2"
    type="number"
    value={minWords}
    onChange={(e) => setMinWords(Number(e.target.value))}
    min={10}
    max={50}
  />
  <span>~</span>
  <input
    className="w-full border rounded p-2"
    type="number"
    value={maxWords}
    onChange={(e) => setMaxWords(Number(e.target.value))}
    min={10}
    max={50}
  />
</div>

          </div>

          <div className="pt-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "出題中..." : "出題"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-4">
        {questions.map((q, index) => (
          <div key={index} className="border p-4 rounded shadow">
            <div>{index + 1}. {q.displayLine1}</div>
            <div className="mt-1 text-gray-700">{q.displayLine2}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
