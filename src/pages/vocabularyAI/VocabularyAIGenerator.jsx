import React, { useState } from "react";
import { generateGPTQuestions } from "@/api/generate-vocab-questions-gpt";
import { Button } from "@/components/ui/button";
import { exportVocabAItoWord } from "@/lib/exportVocabAItoWord";


export default function VocabularyAIGenerator() {
  const [inputWords, setInputWords] = useState("");
  const [level, setLevel] = useState("A1");
  const [countPerWord, setCountPerWord] = useState(1);
  const [minWords, setMinWords] = useState(10);
  const [maxWords, setMaxWords] = useState(20);
  const [groupedQuestions, setGroupedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const handleExportWord = async () => {
    // ✅ 收集被勾選的題目
    const selected = [];
    groupedQuestions.forEach((group, gIdx) => {
      group.questions.forEach((q, qIdx) => {
        const key = `g${gIdx}_q${qIdx}`;
        if (selectedQuestions[key]) {
          selected.push(q);
        }
      });
    });
  
    if (selected.length === 0) {
      alert("請先勾選題目！");
      return;
    }
  
    const blob = await exportVocabAItoWord(selected);
    // ✅ 動態產生檔名
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const filename = `vocabAI${yyyy}${mm}${dd}${hh}${min}.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
  
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

    const words = [];
    for (const entry of wordList) {
      const match = entry.match(/^(.+?)\s*\((.+?)\)$/);
      if (!match) {
        console.warn("❌ 格式不符，略過：", entry);
        continue;
      }
      words.push({ word: match[1], partOfSpeech: match[2] });
    }
    
    const res = await fetch(`/api/start-generate-vocab-questions`, {
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
      const text = await res.text();
      const json = JSON.parse(text);
      if (!res.ok) {
        console.error("❌ 錯誤回應：", json);
        alert("❌ 錯誤！請查看 Console");
        setLoading(false);
        return;
      }
      taskId = json.taskId;
      console.log("📮 任務送出成功，taskId：", taskId);
    } catch (e) {
      console.error("❌ 回傳內容非 JSON 或格式錯誤：", e);
      alert("❌ 回傳格式錯誤，請查看 Console");
      setLoading(false);
      return;
    }

    if (!taskId) {
      alert("❌ 無法送出任務");
      setLoading(false);
      return;
    }

    let tries = 0;
    let maxTries = 30;
    while (tries < maxTries) {
      const pollRes = await fetch(`/api/get-question-result?taskId=${taskId}`, {
        cache: "no-store",
      });
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
    <div className="relative h-screen overflow-hidden">
      {/* ✅ Header */}
      <div className="sticky top-0 z-10 py-2 border-b border-gray-700 bg-gray-800">
        <h1 className="text-4xl font-bold text-center text-gray-100">AI 單字選擇題</h1>
        <Button
  className="absolute right-4 top-2"
  onClick={handleExportWord}
>
  匯出 Word
</Button>
      </div>

      {/* ✅ 主畫面左右分欄 */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* 左側輸入區 */}
        <div className="w-1/3 p-6 h-full">
          <div className="h-full bg-gray-800 rounded shadow flex flex-col px-4 py-4 overflow-hidden">
            <div className="h-[24px]" />
            <p className="mb-2">輸入單字（⼀⾏⼀個字）</p>
            <textarea
              className="w-full h-64 bg-gray-900 text-gray-100 placeholder-gray-400 border border-gray-600 p-4 rounded resize-none shadow"
              placeholder={`例：\ngenerate (v.)\nlanguage (n.)`}
              value={inputWords}
              onChange={(e) => setInputWords(e.target.value)}
            />

            <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
              <div>
                <label className="block mb-1 font-semibold text-gray-100">CEFR</label>
                <select
                  className="bg-gray-900 text-gray-100 border border-gray-600 px-2 py-1 rounded w-full text-center"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-100">每個單字題數</label>
                <input
  type="text"
  pattern="\d*"
  inputMode="numeric"
  className="bg-gray-900 text-gray-100 border border-gray-600 px-2 py-1 rounded w-12 text-center"
  value={countPerWord}
  onChange={(e) => setCountPerWord(Number(e.target.value.replace(/[^\d]/g, "")))}
/>

              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-100">題目字數</label>
                <div className="flex items-center justify-center gap-1">
                <input
  type="text"
  inputMode="numeric"
  pattern="\d*"
  className="bg-gray-900 text-gray-100 border border-gray-600 px-2 py-1 rounded w-12 text-center"
  value={minWords}
  onChange={(e) =>
    setMinWords(Number(e.target.value.replace(/[^\d]/g, "")))
  }
/>

  <span className="text-gray-300">~</span>
  <input
    type="text"
    inputMode="numeric"
    pattern="\d*"
    className="bg-gray-900 text-gray-100 border border-gray-600 px-2 py-1 rounded w-12 text-center"
    value={maxWords}
    onChange={(e) => setMaxWords(Number(e.target.value))}
  />
</div>
              </div>
            </div>

            <button
              className={`mt-3 w-full bg-blue-500 hover:bg-blue-600 ${
                loading ? "animate-pulse cursor-not-allowed" : ""
              } text-white py-2 rounded shadow`}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "生成中..." : "出題"}
            </button>
          </div>
        </div>

        {/* 右側題目顯示區 */}
        <div className="w-2/3 p-6 h-full">
          <div className="h-full bg-gray-800 rounded shadow px-6 py-4 flex flex-col">
            {/* 功能按鈕 */}
            <div className="mb-4 flex gap-4">
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => {
                  const newSelected = {};
                  groupedQuestions.forEach((group, gIdx) => {
                    group.questions.forEach((q, qIdx) => {
                      newSelected[`g${gIdx}_q${qIdx}`] = true;
                    });
                  });
                  setSelectedQuestions(newSelected);
                }}
              >
                全部勾選
              </Button>
              <Button
                className="bg-gray-600 hover:bg-gray-700 text-white"
                onClick={() => setSelectedQuestions({})}
              >
                取消勾選
              </Button>
            </div>

            {/* 題目區域 */}
            <div className="overflow-y-auto flex-1 pr-1 border border-gray-500 rounded-md bg-gray-800 shadow-inner p-4">
              {Array.isArray(groupedQuestions) && groupedQuestions.length > 0 ? (
                groupedQuestions.map((group, gIdx) => (
                  <div key={gIdx} className="mb-8">
                    <h2 className="text-xl font-bold mb-2">
                      {group.word} ({group.partOfSpeech})
                    </h2>
                    {group.questions.map((q, qIdx) => {
                      const key = `g${gIdx}_q${qIdx}`;
                      return (
                        <div key={key} className="border rounded-md p-4 shadow-sm mb-4">
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              className="mt-1"
                              checked={!!selectedQuestions[key]}
                              onChange={() =>
                                setSelectedQuestions((prev) => ({
                                  ...prev,
                                  [key]: !prev[key],
                                }))
                              }
                            />
                            <div>
                              <p className="font-semibold mb-1">
                                {qIdx + 1}. ( {q.answerLetter} ) {q.question}
                              </p>
                              <div className="pl-4 flex gap-6 flex-wrap">
                                {q.options.map((choice, idx) => (
                                  <span key={idx}>
                                    ({String.fromCharCode(65 + idx)}) {choice}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">請先輸入單字並點擊「出題」</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
