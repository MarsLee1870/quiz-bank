import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";
import { saveAs } from "file-saver";
import { exportReadingToWord } from "@/lib/exportReadingToWord";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
const noBorder = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

export default function ReadingTestGenerator() {
    const [article, setArticle] = useState("");
    const [questions, setQuestions] = useState("");
    const [loading, setLoading] = useState(false); // 用來控制按鈕的 loading 狀態
    const [topic, setTopic] = useState("");
    const [wordMin, setWordMin] = useState("");
    const [wordMax, setWordMax] = useState("");
    const [paragraphCount, setParagraphCount] = useState("");
    const [CEFR, setCEFR] = useState("");
    const [style, setStyle] = useState("");
    const [tone, setTone] = useState("");
    const [audience, setAudience] = useState("");
    const [totalQuestions, setTotalQuestions] = useState("");
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const handleExportWord = () => {
      if (selectedQuestions.length === 0) {
        alert("請先勾選題目");
        return;
      }
    
      // 根據勾選題目重組成 questions 陣列
      let questionList = [];

try {
  questionList = typeof questions === "string" && questions.trim().startsWith("[")
    ? JSON.parse(questions)
    : Array.isArray(questions)
      ? questions
      : questions.split(/\n(?=\d+\.)/);
} catch {
  questionList = questions.split(/\n(?=\d+\.)/);
}

const selected = questionList
  .map((q, index) => {
    const qId = `q-${index}`;
    if (!selectedQuestions.includes(qId)) return null;

    if (typeof q === "object") {
      // JSON 格式
      return {
        question: q.question,
        options: q.options,
        answer: q.answer,
        hint: q.hint || "",
      };
    }

    // 字串格式
    const answerMatch = q.match(/Answer:\s*([A-D])/);
    const hintMatch = q.match(/Hint:\s*(.+)/);
    const answer = answerMatch ? answerMatch[1] : "";
    const hint = hintMatch ? hintMatch[1].trim() : "";

    const lines = q
      .replace(/Answer:\s*[A-D]/, "")
      .replace(/Hint:\s*.+/, "")
      .trim()
      .split("\n");

    const question = lines[0]?.trim();
    const options = lines.slice(1).map((l) => l.trim());

    return { question, options, answer, hint };
  })
  .filter(Boolean);
    
      exportReadingToWord(article, selected);
    };
    
     
    const getWordCount = (text) => {
      return text?.trim() ? text.trim().split(/\s+/).length : 0;
      };
    const [typeCounts, setTypeCounts] = useState({
        主旨型: "",
        細節型: "",
        目的型: "",
        架構型: "",
        釋義型: "",
        語氣型: "",
        推論型: "",
});
    const handleGenerateArticle = async () => {
        if (!topic || !wordMin || !wordMax || !paragraphCount || !CEFR) {
            alert("請填寫必填欄位");
            return;
          }
        
        setLoading(true);
        setArticle("");
    
        const payload = {
            topic,
            wordMin: Number(wordMin),
            wordMax: Number(wordMax),
            paragraphCount: Number(paragraphCount),
            CEFR,
            style,
            tone,
            audience,
        };
    
        // 🐞 建議加一行 debug 看 payload 是否正確
        console.log("送出 payload：", payload);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reading/functions/start-generate-reading-article`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    
        if (!res.ok) {
            const errorText = await res.text();
            console.error("❌ 伺服器錯誤：", errorText);
            setArticle("❌ 文章生成錯誤：" + errorText);
            setLoading(false);
            return;
        }
    
        let taskId;
try {
  const json = await res.json();
  taskId = json.taskId;
} catch (err) {
  console.error("❌ 解析回應失敗：", err);
  setArticle("❌ 伺服器回傳格式錯誤");
  setLoading(false);
  return;
}

    
let retryCount = 0;
const interval = setInterval(async () => {
    try {
      const check = await fetch(`${import.meta.env.VITE_API_URL}/api/reading/functions/get-article-result?taskId=${taskId}`);
      if (!check.ok) throw new Error("查無任務");

      const data = await check.json();

      if (data.status === "done") {
        setArticle(data.article);
        setQuestions("");
        setLoading(false);
        clearInterval(interval);
    } else if (data.status === "failed") {
        setArticle("❌ 任務失敗！");
        setLoading(false);
        clearInterval(interval);
    } else if (data.status === "not_found") {
        console.log("🔄 任務尚未完成，繼續等待...");
        // 不中止，繼續等下一輪
    }
    
    } catch (err) {
      console.log("⏳ 輪詢中... (文章尚未完成)");

      retryCount++;
      if (retryCount > 15) {
        console.warn("⛔ 超過輪詢次數上限，中止");
        clearInterval(interval);
        setLoading(false);
        setArticle("⚠️ 等待過久，請重試");
      }
    }
}, 2000);
}
    
const handleGenerateQuestions = async () => {
    const totalTypeCount = Object.values(typeCounts).reduce((a, b) => a + Number(b), 0);

  if (!totalQuestions && totalTypeCount === 0) {
    alert("請填寫總題數或各題型題數");
    return;
  }
    
    setLoading(true);
    setQuestions("");

    if (!article) {
        alert("請先生成文章！");
        setLoading(false);
        return;
    }
    const questionConfig = {
        total: Number(totalQuestions) || 5,
        types: Object.fromEntries(
          Object.entries(typeCounts).map(([k, v]) => [k, Number(v) || 0])
        ),
      };
    
    // ✅ 若使用者沒填各題型題數，則平均分配
if (totalTypeCount === 0) {
  const defaultTypes = ["主旨型", "細節型", "推論型"];
  const perType = Math.floor(questionConfig.total / defaultTypes.length);
  const remainder = questionConfig.total % defaultTypes.length;

  defaultTypes.forEach((type, i) => {
    questionConfig.types[type] = perType + (i < remainder ? 1 : 0);
  });
}
const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reading/functions/start-generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article, questionConfig }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ 出題錯誤：", errorText);
        setQuestions("❌ 伺服器錯誤：" + errorText);
        setLoading(false);
        return;
    }

    const { taskId } = await res.json();

    const interval = setInterval(async () => {
      const check = await fetch(`${import.meta.env.VITE_API_URL}/api/reading/functions/get-question-result?taskId=${taskId}`);
        const data = await check.json();

        if (data.status === "done") {
            setQuestions(data.questions);
            setLoading(false);
            clearInterval(interval);
        } else if (data.status === "failed") {
            setQuestions("❌ 出題任務失敗！");
            setLoading(false);
            clearInterval(interval);
        } else if (data.status === "not_found") {
            console.log("🔄 任務尚未找到，繼續等待...");
            // 不中止，繼續等
        } else {
            console.log("⏳ 任務處理中，等待中...");
        }
        
    }, 2000);
};
const formatQuestions = (raw) => {
  let questionList = [];

try {
  questionList = typeof raw === "string" && raw.trim().startsWith("[")
    ? JSON.parse(raw)
    : Array.isArray(raw)
      ? raw
      : raw.split(/\n(?=\d+\.)/);
} catch (err) {
  questionList = raw.split(/\n(?=\d+\.)/);
}


  return questionList.map((q, index) => {
    let question = "", options = [], answer = "", hint = "";
    const questionId = `q-${index}`;
    const isSelected = selectedQuestions.includes(questionId);
    const handleCheckboxChange = () => {
      setSelectedQuestions(prev =>
        prev.includes(questionId)
          ? prev.filter(id => id !== questionId)
          : [...prev, questionId]
      );
    };

    if (typeof q === "string") {
      const answerMatch = q.match(/Answer:\s*([A-D])/);
      const hintMatch = q.match(/Hint:\s*(.+)/);
      answer = answerMatch ? answerMatch[1] : "";
      hint = hintMatch ? hintMatch[1].trim() : "";

      const cleaned = q
        .replace(/Answer:\s*[A-D]/, "")
        .replace(/Hint:\s*.+/, "")
        .trim();

      const lines = cleaned.split("\n");
      question = lines[0]?.trim();
      options = lines.slice(1).map((l) =>
        l.trim().replace(/^\([A-D]\)\s*/, ""));
    } else {
      question = q.question;
      options = q.options || [];
      answer = q.answer || "";
      hint = q.hint || "";
    }

    return (
      <div key={index} className="mb-6">
        <div className="flex items-start gap-2 mb-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            className="mt-1 accent-blue-500"
          />
          <p className="font-medium">{question}</p>
        </div>
        <div className="ml-6 space-y-1">
          {options.map((opt, i) => (
            <p key={i}>{`(${String.fromCharCode(65 + i)}) ${opt}`}</p>
          ))}
          {hint && <p className="italic text-gray-400">Hint: {hint}</p>}
        </div>
      </div>
    );
  });
};

  
  
    return (
        <div className="relative p-6 space-y-8">

            {/* Header 固定 */}
            <div className="sticky top-0 z-10 relative py-2 border-b border-gray-700 bg-gray-800">
                <h1 className="text-4xl font-bold text-center text-gray-100">AI 閱讀測驗</h1>
                <Button
  className="absolute right-4 top-2"
  onClick={handleExportWord}
>
  匯出 Word
</Button>

            </div>

            {/* ===== 上下區塊包起來 ===== */}
            <div className="space-y-24">

                {/* ===== 文章區 ===== */}
                <div>
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-4 space-y-3">
                            <h2 className="font-semibold text-2xl">文章設定</h2>

                            {/* 主題 */}
                            <div>
                                <label>主題（必填）</label>
                                <Textarea
                                placeholder="輸入文章主題"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                    className="w-full h-48 bg-gray-900 text-gray-100 placeholder-gray-400 border border-gray-600 p-4 rounded resize-none shadow"
                                />
                            </div>

                            {/* 字數 */}
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <label>字數（必填）</label>
                                    <Input placeholder="最小" value={wordMin} onChange={(e) => setWordMin(e.target.value)} />
                                </div>
                                <span>~</span>
                                <div className="flex-1">
                                    <label>&nbsp;</label>
                                    <Input placeholder="最大" value={wordMax} onChange={(e) => setWordMax(e.target.value)} />
                                </div>
                            </div>

                            {/* 段落數 */}
                            <div>
                                <label>段落數（必填）</label>
                                <Input placeholder="段落數" value={paragraphCount} onChange={(e) => setParagraphCount(e.target.value)} />
                            </div>

                            {/* CEFR */}
                            <div>
                                <label>CEFR（必填）</label>
                                <Select value={CEFR} onValueChange={setCEFR}>
                                <SelectTrigger><SelectValue placeholder="選擇 CEFR" /></SelectTrigger>
                                <SelectContent>
                                    {["A1", "A2", "B1", "B2", "C1", "C2"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                                </Select>

                            </div>

                            {/* 文體 */}
                            <div>
                                <label>文體（可選）</label>
                                <Select value={style} onValueChange={setStyle}>
                                <SelectTrigger><SelectValue placeholder="選擇文體" /></SelectTrigger>
                                <SelectContent>
                                    {["article", "letter", "email", "advertisement", "announcement", "notice", "story", "dialogue", "news"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                                </Select>
                            </div>

                            {/* 語氣 */}
                            <div>
                                <label>語氣（可選）</label>
                                <Select value={tone} onValueChange={setTone}>
                                <SelectTrigger><SelectValue placeholder="選擇語氣" /></SelectTrigger>
                                <SelectContent>
                                    {["neutral", "formal", "informal", "friendly", "enthusiastic", "concerned", "persuasive", "humorous"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                                </Select>
                            </div>

                            {/* 讀者 */}
                            <div>
                                <label>讀者（可選）</label>
                                <Select value={audience} onValueChange={setAudience}>
                                <SelectTrigger><SelectValue placeholder="選擇讀者" /></SelectTrigger>
                                <SelectContent>
                                    {["general", "students", "teachers", "parents", "tourists", "customers", "employees", "kids"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                                </Select>
                            </div>

                            {/* 寫文章 */}
                            <Button
  className={`w-full bg-blue-500 ${loading ? 'animate-pulse cursor-not-allowed' : ''}`}
  onClick={handleGenerateArticle}
  disabled={loading}
>
  {loading ? "生成中..." : "寫文章"}
</Button>


                        </div>

                        {/* 文章內容 */}
                        <div className="col-span-8">
  <h2 className="font-semibold text-2xl mb-2">文章內容</h2>
  
  <div className="relative">
    <Textarea
      className="w-full h-[700px] bg-gray-900 text-gray-100 placeholder-gray-400 border border-gray-600 p-4 rounded resize-none shadow font-['Arial'] text-lg leading-relaxed"
      placeholder="這裡會顯示 AI 生成的文章，或手動輸入文章"
      value={article}
      onChange={(e) => setArticle(e.target.value)}
    />

    {/* Word Count 顯示區塊 */}
    <div className="absolute right-7 bottom-2 text-sm text-gray-400">
      ( word count: {getWordCount(article)} )
    </div>
  </div>
</div>



                    </div>
                </div>

                {/* ===== 題目區 ===== */}
                <div>
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-4 space-y-3">
                            <h2 className="font-semibold text-2xl">題目設定</h2>
                            <div>
                                <label>題數（AI決定題型，若要自選題型請忽略此欄）</label>
                                <Input
                                placeholder="總題數"
                                value={totalQuestions}
                                onChange={(e) => setTotalQuestions(e.target.value)}
                                />
                            </div>

                            {["主旨型", "細節型", "目的型", "架構型", "釋義型", "語氣型", "推論型"].map((type) => (
                            <div key={type}>
                                <label>{type}（可填）</label>
                                <Input
                                placeholder={`幾題 ${type}`}
                                value={typeCounts[type]}
                                onChange={(e) =>
                                    setTypeCounts((prev) => ({ ...prev, [type]: e.target.value }))
                                }
                                />
                            </div>
                            ))}

<Button
  className={`w-full bg-blue-500 ${loading ? 'animate-pulse cursor-not-allowed' : ''}`}
  onClick={handleGenerateQuestions}
  disabled={loading}
>
  {loading ? "生成中..." : "出題"}
</Button>

                        </div>

                        {/* 題目內容 */}
<div className="col-span-8">
  <h2 className="font-semibold text-2xl mb-2">題目內容</h2>
    {/* 勾選控制按鈕 */}
    <div className="flex gap-2 mb-3">
    <Button
  className="bg-blue-500 hover:bg-blue-600"
  onClick={() => {
    try {
      let list = [];

      // 如果是字串（大多數情況），嘗試轉成 JSON 陣列
      if (typeof questions === "string" && questions.trim().startsWith("[")) {
        list = JSON.parse(questions);
      } else if (Array.isArray(questions)) {
        list = questions;
      } else {
        list = questions.split(/\n(?=\d+\.)/);
      }

      const allIds = list.map((_, index) => `q-${index}`);
      setSelectedQuestions(allIds);
    } catch (err) {
      console.error("⚠️ 全部勾選失敗：", err);
    }
  }}
>
  全部勾選
</Button>

    <Button
  className="bg-gray-600 hover:bg-gray-700 text-white"
  onClick={() => setSelectedQuestions([])}
>
  取消勾選
</Button>
  </div>

  <div className="border h-[570px] overflow-y-auto p-2 rounded">
    <div className="font-['Arial'] text-lg leading-tight">
      {questions
        ? formatQuestions(questions)
        : <p className="text-gray-400 text-base">這裡會顯示 AI 生成的題目</p>}
    </div>
  </div>
</div>
                    </div>
                </div>

            </div>

        </div>
    );
}
