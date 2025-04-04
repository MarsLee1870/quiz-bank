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

    const groupResults = [];

    for (const entry of wordList) {
      const match = entry.match(/^(.+?)\s*\((.+?)\)$/);
      if (!match) {
        console.warn("❌ 格式不符，略過：", entry);
        continue;
      }

      const word = match[1];
      const partOfSpeech = match[2];
      const questionList = [];

      for (let i = 0; i < countPerWord; i++) {
        const result = await generateGPTQuestions({
          word,
          partOfSpeech,
          level,
          lengthRange: { min: minWords, max: maxWords },
        });

        if (result) {
          console.log("✅ 後端回傳的 result：", JSON.stringify(result, null, 2));
          const { question, options, answer } = result;

// AI 沒有告訴你答案是 A / B / C / D，你自己來找
const correctIndex = options.findIndex(opt => 
    opt.trim().toLowerCase() === answer.trim().toLowerCase()
);

if (correctIndex === -1) {
    console.error("❌ AI 回傳的答案不在選項內！", result);
    continue; // 不處理這一題
}

const answerLetter = ["A", "B", "C", "D"][correctIndex];

questionList.push({
    question,
    options,
    answerLetter, // 自己組裝 ABCD
});
        }
      }

      groupResults.push({
        word,
        partOfSpeech,
        questions: questionList,
      });
    }

    setGroupedQuestions(groupResults);
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
            className="mt-6 w-full text-xl px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white shadow rounded"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "出題中..." : "出題"}
          </button>
        </div>

        {/* 右側題目展示區 */}
        <div className="h-[600px] overflow-y-auto pr-2 space-y-8 border-l pl-6">
          {groupedQuestions.map((group, idx) => (
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
