import { useEffect, useState } from "react";
import getGoogleSheetData from "@/api/getGoogleSheetData";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

const questionTypes = ["選擇題", "填空題", "克漏字", "寫出句子", "翻譯"];

export default function GrammarQuestionSelectPage() {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const data = await getGoogleSheetData("grammar", "時態"); // 這裡之後改成動態來源
      setQuestions(data);
    };
    fetchQuestions();
  }, []);

  const toggleQuestion = (q) => {
    setSelectedQuestions((prev) =>
      prev.includes(q) ? prev.filter((item) => item !== q) : [...prev, q]
    );
  };

  const handleExport = async () => {
    if (selectedQuestions.length === 0) {
      alert("請先選擇至少一題！");
      return;
    }

    const questionParagraphs = selectedQuestions.map((q, index) => {
      const content = [];

      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${q["題目"]}`,
              bold: true,
              size: 28,
            }),
          ],
        })
      );

      if (q["題型"] === "選擇題") {
        ["A1", "B1", "C1", "D1"].forEach((opt, i) => {
          const label = ["A", "B", "C", "D"][i];
          const text = q[`選項${opt}`];
          if (text) content.push(new Paragraph(`${label}. ${text}`));
        });
      }

      if (q["答案1"]) {
        content.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `答案：${q["答案1"]}`,
                bold: true,
              }),
            ],
          })
        );
      }

      content.push(new Paragraph(""));
      return content;
    });

    const doc = new Document({
      sections: [
        {
          children: questionParagraphs.flat(),
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "文法題目.docx");
  };

  const groupedByType = questionTypes.reduce((acc, type) => {
    acc[type] = questions.filter((q) => q["題型"] === type);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-5xl mx-auto relative">
      {/* 固定按鈕區域 */}
      <div className="fixed top-4 left-4 z-50">
        <Button variant="outline" onClick={() => window.history.back()}>
          返回上一頁
        </Button>
      </div>
      <div className="fixed top-4 right-4 z-50">
        <Button onClick={handleExport}>匯出成 Word</Button>
      </div>

      <h1 className="text-2xl font-bold mb-6">選擇題目</h1>

      {/* 題型目錄 */}
      <div className="flex flex-wrap gap-4 mb-6">
        {questionTypes.map((type) => (
          <a key={type} href={`#${type}`} className="text-blue-600 underline">
            {type}
          </a>
        ))}
      </div>

      {/* 顯示所有題目 */}
      {questionTypes.map((type) => (
        <div key={type} id={type} className="mb-10">
          <h2 className="text-xl font-semibold mb-2">{type}</h2>
          <div className="space-y-4">
            {groupedByType[type].map((q, index) => (
              <div
                key={q["題號"] || index}
                className="border p-4 rounded-md shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedQuestions.includes(q)}
                    onCheckedChange={() => toggleQuestion(q)}
                  />
                  <div>
                    <p className="font-medium mb-2">{q["題目"]}</p>
                    {q["題型"] === "選擇題" && (
                      <ul className="list-disc pl-5">
                        <li>A. {q["選項A1"]}</li>
                        <li>B. {q["選項B1"]}</li>
                        <li>C. {q["選項C1"]}</li>
                        <li>D. {q["選項D1"]}</li>
                      </ul>
                    )}
                    {q["答案1"] && (
                      <p className="mt-2 text-green-600">答案：{q["答案1"]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
