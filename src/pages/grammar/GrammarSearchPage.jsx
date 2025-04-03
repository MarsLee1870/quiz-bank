import { useEffect, useState } from "react"; 
import { Button } from "@/components/ui/button";
import { FolderKanban, FileText, ChevronRight, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@radix-ui/react-collapsible";
import getGoogleSheetData from "@/lib/getGoogleSheetData";

// ✅ ✅ ✅ 加入整理資料的工具 function

// 將 sheetData 轉成章節結構
const formatGrammarSheetData = (sheetData) => {
  const books = {};

  sheetData.forEach(row => {
    const bookName = row["書名"] || "未指定書名";
    const year = row["年份"] || "未指定年份";
    const chapterName = row["大標題"] || "未分類章節";
    const topic = {
      sub: row["小標題"] || "未分類小標題",
      word: row["Word檔名"] || "未指定word"
    };

    if (!books[bookName]) books[bookName] = { book: bookName, year: year, chapters: {} };
    if (!books[bookName].chapters[chapterName]) books[bookName].chapters[chapterName] = [];
    books[bookName].chapters[chapterName].push(topic);
  });

  return Object.values(books).map(book => ({
    ...book,
    chapters: Object.entries(book.chapters).map(([chapter, topics]) => ({
      chapter,
      topics
    }))
  }));
};

// 取得所有 word 檔（用於「依檔案分類」）
const extractWordsFromGroupedData = (grouped) => {
  const wordSet = new Set();
  grouped.forEach(g => g.chapters.forEach(c => c.topics.forEach(t => wordSet.add(t.word))));
  return [...wordSet];
};

const GrammarSearchPage = () => {
  const [viewMode, setViewMode] = useState("chapter");
  const [data, setData] = useState([]); 
  const [words, setWords] = useState([]); 

  useEffect(() => {
    const fetchData = async () => {
      const sheetData = await getGoogleSheetData("grammar", "工作表1"); 

      // ✅ 用 function 整理資料
      const grouped = formatGrammarSheetData(sheetData);
      setData(grouped);

      // ✅ 自動整理 words
      setWords(extractWordsFromGroupedData(grouped));
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-800 min-h-screen text-gray-100 space-y-4">
      <div className="flex justify-between items-center border-b border-gray-600 pb-4 mb-4">
        <h1 className="text-4xl font-bold mx-auto">文法題庫搜尋</h1>
        <div className="absolute right-6 space-x-2 flex">
          <Button className={viewMode === "chapter" ? "bg-blue-500 text-white" : "bg-gray-600 text-gray-300"} onClick={() => setViewMode("chapter")}>依章節分類</Button>
          <Button className={viewMode === "word" ? "bg-blue-500 text-white" : "bg-gray-600 text-gray-300"} onClick={() => setViewMode("word")}>依檔案分類</Button>
        </div>
      </div>

      {/* Group by 章節 */}
      {viewMode === "chapter" && (
        <div className="space-y-4">
          {data.map((b, i) => (
            <Collapsible key={i}>
              <CollapsibleTrigger className="flex items-center gap-2 py-2 leading-relaxed cursor-pointer">
                <ChevronRight className="transition-transform group-data-[state=open]:rotate-90" />
                <span className="text-xl font-bold">{b.book}</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 space-y-2">
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 py-2 leading-relaxed cursor-pointer">
                    <ChevronRight className="transition-transform group-data-[state=open]:rotate-90" />
                    <span className="text-lg font-semibold">出題年份：{b.year}</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-1">
                    {b.chapters.map((c, j) => (
                      <Collapsible key={j}>
                        <CollapsibleTrigger className="flex items-center gap-2 py-2 leading-relaxed cursor-pointer">
                          <ChevronRight className="transition-transform group-data-[state=open]:rotate-90" />
                          <span>{c.chapter}</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-4 space-y-1">
                          {c.topics.map((t, k) => (
                            <div key={k} className="pl-2">{t.sub} ➤ {t.word}</div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Group by Word */}
      {viewMode === "word" && (
        <div className="space-y-4">
          {data.map((b, i) => (
            <Collapsible key={i}>
              <CollapsibleTrigger className="flex items-center gap-2 py-2 leading-relaxed cursor-pointer">
                <ChevronRight className="transition-transform group-data-[state=open]:rotate-90" />
                <span className="text-xl font-bold">{b.book}</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 space-y-2">
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 py-2 leading-relaxed cursor-pointer">
                    <ChevronRight className="transition-transform group-data-[state=open]:rotate-90" />
                    <span className="text-lg font-semibold">出題年份：{b.year}</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-2">
                    {words.map((w, j) => (
                      <Collapsible key={j}>
                        <CollapsibleTrigger className="flex items-center gap-2 py-2 leading-relaxed cursor-pointer">
                          <ChevronRight className="transition-transform group-data-[state=open]:rotate-90" />
                          <span className="text-md font-semibold flex items-center gap-2">
                            <FileText className="w-5 h-5" /> {w}
                          </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-4 space-y-1">
                          {b.chapters
                            .flatMap((c) =>
                              c.topics
                                .filter((t) => t.word === w)
                                .map((t) => ({
                                  chapter: c.chapter,
                                  sub: t.sub,
                                }))
                            )
                            .map((t, k) => (
                              <div key={k}>
                                {t.chapter} / {t.sub}
                              </div>
                            ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
};

export default GrammarSearchPage;
