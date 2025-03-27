import { useEffect, useState } from "react";
import { getVocabularyData } from "@/lib/getVocabularyData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function VocabularySearchPage() {
  const [allQuestions, setAllQuestions] = useState([]);
  const [inputText, setInputText] = useState("");
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [selectedQuestions, setSelectedQuestions] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const data = await getVocabularyData();
      setAllQuestions(data);
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    const words = inputText
      .split("\n")
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w);

    const grouped = {};

    words.forEach((word) => {
      const matched = allQuestions
        .filter((q) => q["正解單字"]?.toLowerCase() === word)
        .map((q) => {
          const choices = [
            { text: q["選項A"], original: "A" },
            { text: q["選項B"], original: "B" },
            { text: q["選項C"], original: "C" },
            { text: q["選項D"], original: "D" },
          ];

          const correctLetter = q["答案"]?.toUpperCase?.();
          const correctText = q[`選項${correctLetter}`];

          const shuffledChoices = shuffleArray(choices);
          const newCorrectIndex = shuffledChoices.findIndex(
            (c) => c.text === correctText
          );

          return {
            ...q,
            shuffledChoices,
            newCorrectAnswer: String.fromCharCode(65 + newCorrectIndex),
          };
        });

        grouped[word] = matched.length > 0 ? matched : null;

    });

    setGroupedQuestions(grouped);
    setSelectedQuestions({});
  };

  const toggleSelect = (questionId) => {
    setSelectedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };
  
  return (
    <div className="relative h-screen overflow-hidden">
      {/* 中央標題 */}
      <div className="w-full flex items-center justify-between px-6 py-6 border-b border-gray-300">
  <h1 className="text-4xl font-bold text-center w-full">單字題庫</h1>
  <div className="absolute right-6">
    <Button className="bg-blue-600 text-white">匯出 word</Button>
  </div>
</div>

  
      <div className="flex h-full">
        {/* 左側輸入區塊 */}
        <div className="w-1/3 p-6 border-r border-gray-300 flex flex-col">
          <p className="mb-2">輸入單字（⼀⾏⼀個字）</p>
          <textarea
            className="h-60 resize-none border rounded-md p-2 overflow-y-auto"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        <Button className="mt-4 bg-blue-600 text-white" onClick={handleSearch}>
          出題
        </Button>
      </div>

      {/* 右側題目顯示區塊 */}
      <div className="w-2/3 p-6 overflow-y-auto relative h-[calc(100vh-96px)]">
      {Object.keys(groupedQuestions).length === 0 ? (
  <p className="text-gray-500">請先輸入單字並點擊「出題」</p>
) : (
  Object.entries(groupedQuestions).map(([word, questions]) => (
    <div key={word} className="mb-8">
      <h2 className="text-xl font-bold mb-2">{word}</h2>

      {questions === null ? (
        <p className="text-red-600 pl-2">沒這題目，你自己出吧！加油！</p>
      ) : (
        questions.map((q, idx) => (
          <div
            key={q["題號"] || idx}
            className="border rounded-md p-4 shadow-sm mb-4"
          >
            <div className="flex items-start gap-2">
              <Checkbox
                checked={!!selectedQuestions[q["題號"]]}
                onCheckedChange={() => toggleSelect(q["題號"])}
              />
              <div>
              <p className="font-semibold mb-1">
  {idx + 1}. ( {q.newCorrectAnswer} ) {q["題目內容"]}
</p>
                <div className="pl-4 flex gap-6 flex-wrap">
                  {q.shuffledChoices.map((choice, idx) => (
                    <span key={idx}>
                      ({String.fromCharCode(65 + idx)}) {choice.text}
                    </span>
                  ))}
                </div>
                <p className="pl-4 text-sm text-gray-500">
                  (來源：{q["來源"]})
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  ))
)}
         </div>
    </div>
    </div>
  );
}
