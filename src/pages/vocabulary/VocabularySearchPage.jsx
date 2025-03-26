import { useEffect, useState } from "react";
import getGoogleSheetData from "@/api/getGoogleSheetData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ✅ 隨機排序選項用
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
  const [searchWord, setSearchWord] = useState("");
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  // ✅ 抓取所有單字題目
  useEffect(() => {
    const fetchData = async () => {
      const data = await getGoogleSheetData("vocabulary");
      setAllQuestions(data);
    };
    fetchData();
  }, []);

  // ✅ 搜尋單字時觸發篩選 + 重新洗牌選項
  const handleSearch = (word) => {
    setSearchWord(word);

    const results = allQuestions
      .filter((q) =>
        q["正解單字"]?.toLowerCase().includes(word.toLowerCase())
      )
      .map((q) => {
        const choices = ["選項A1", "選項B1", "選項C1", "選項D1"].map((key) => ({
          text: q[key],
          isCorrect: q[key] === q["正解單字"],
        }));
        return {
          ...q,
          shuffledChoices: shuffleArray(choices),
        };
      });

    setFilteredQuestions(results);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">單字題庫搜尋</h1>

      <Input
        type="text"
        placeholder="輸入單字，例如：happy"
        value={searchWord}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {filteredQuestions.length === 0 && searchWord && (
        <p className="text-gray-600">找不到符合「{searchWord}」的題目。</p>
      )}

      {filteredQuestions.map((q, index) => (
        <div key={q["題號"] || index} className="border rounded-md p-4 shadow-sm">
          <p className="font-semibold mb-2">
            {q["題號"]}. {q["題目"]}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {q.shuffledChoices.map((choice, idx) => (
              <li key={idx} className={choice.isCorrect ? "text-green-600" : ""}>
                {String.fromCharCode(65 + idx)}. {choice.text}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
