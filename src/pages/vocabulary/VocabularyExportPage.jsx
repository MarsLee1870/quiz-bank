// src/pages/vocabulary/VocabularyExportPage.jsx
import React, { useEffect, useState } from "react";

export default function VocabularyExportPage() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("exportQuestions") || "[]");
    setQuestions(data);
  }, []);

  if (questions.length === 0) return <p>沒有勾選的題目</p>;

  const renderQuestion = (q, index) => {
    const answerLetter = q.newCorrectAnswer;

    return (
      <div key={q["題號"]} style={{ marginBottom: "0px" }}>
        {/* 題號 + 答案 + 題目 */}
        <div style={{ fontFamily: "Times New Roman", fontSize: "14pt", lineHeight: "1.15", marginBottom: "0.3em" }}>
          {/* 題號 */}
          <span>{index + 1}. </span>
          {/* ( A ) 正解紅色粗體 */}
          <span>(<span style={{ color: "red", fontWeight: "bold" }}>{answerLetter}</span>)</span>
          {/* 假 tab */}
          <span style={{ display: "inline-block", width: "1.5cm" }}></span>
          {/* 題目 */}
          <span>{q["題目內容"]}</span>
        </div>

        {/* 選項 (A)(B)(C)(D) */}
        <div style={{ fontFamily: "Times New Roman", fontSize: "14pt", lineHeight: "1.15" }}>
          <span style={{ display: "inline-block", width: "4cm" }}>(A) {q.shuffledChoices[0].text}</span>
          <span style={{ display: "inline-block", width: "5cm" }}>(B) {q.shuffledChoices[1].text}</span>
          <span style={{ display: "inline-block", width: "5cm" }}>(C) {q.shuffledChoices[2].text}</span>
          <span style={{ display: "inline-block", width: "5cm" }}>(D) {q.shuffledChoices[3].text}</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      fontFamily: "Times New Roman",
      fontSize: "14pt",
      lineHeight: "1.15",
      padding: "30px",
      background: "white",
      color: "black",
    }}>
      {questions.map((q, idx) => renderQuestion(q, idx))}
    </div>
  );
}
