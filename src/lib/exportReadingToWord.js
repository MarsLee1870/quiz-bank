import { saveAs } from "file-saver";
import {
    Document, Packer, Paragraph, TextRun,
    Table, TableRow, TableCell, WidthType, AlignmentType
} from "docx";

function cm(n) { return n * 567; } // cm 轉 twip

export async function exportReadingToWord(article, questions) {

    const allRows = questions.flatMap((q, idx) => {

        const questionNumberWidth = cm(2);
        const choiceCellWidths = [cm(3.5), cm(3.5), cm(3.5), cm(3.5)];
        const firstEmptyCellWidth = cm(2);
        const questionIndent = 50;
        const safeOptions = (q.options || []).concat(["", "", "", ""]).slice(0, 4);
        

// ✅ 保留正確答案，避免被誤刪
const rawQuestion = typeof q.question === "string" ? q.question : q.question?.question || "";

// 從原始題幹擷取出答題字母與題目本體
const match = rawQuestion.match(/^\d+\.\s*\(\s*([A-D])\s*\)\s*(.+)/);
const questionText = match ? match[2].trim() : rawQuestion.trim(); // 題幹
const answerLetter = q.answer || (match ? match[1] : "");           // 正解（優先用 q.answer）



        return [

            // ===== 第一列 分左右兩欄 =====
new TableRow({
    children: [
      // 左欄：題號 + 答案
      new TableCell({
        width: { size: cm(2), type: WidthType.DXA },
        children: [
          new Paragraph({
            spacing: { line: 276 },
            children: [
              new TextRun({
                text: `${idx + 1}. ( `,
                font: "Times New Roman",
                size: 28,
              }),
              new TextRun({
                text: answerLetter,
                font: "Times New Roman",
                size: 28,
                bold: true,
                color: "FF0000",
              }),
              new TextRun({
                text: " )",
                font: "Times New Roman",
                size: 28,
              }),
            ],
          }),
        ],
      }),
      // 右欄：題幹
      new TableCell({
        children: [
          new Paragraph({
            spacing: { line: 276 },
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: questionText,
                font: "Times New Roman",
                size: 28,
              }),
            ],
          }),
        ],
      }),
    ],
  }),
  
              
 
            // ===== 第二列 空白 + 選項 =====
            new TableRow({
                children: [
                    new TableCell({ children: [] }),
                    new TableCell({
                        children: safeOptions.map((opt, i) =>
                            new Paragraph({
                                spacing: { line: 276 },
                                children: [
                                    new TextRun({
                                        text: `(${String.fromCharCode(65 + i)}) ${opt.replace(/^\([A-D]\)\s*/, '')}`,
                                        font: "Times New Roman",
                                        size: 28,
                                    }),
                                ],
                            })
                        ),
                    }),
                ],
            }),

            // ===== 第三列 Hint: + Hint內容 =====
            new TableRow({
                children: [
                    new TableCell({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "Hint:",
                                        italics: true,
                                        font: "Times New Roman",
                                        size: 24,
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new TableCell({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: q.hint || "",
                                        italics: true,
                                        font: "Times New Roman",
                                        size: 24,
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),

            // ===== 題組之間空白 =====
            new TableRow({
                children: [
                    new TableCell({ children: [] }),
                    new TableCell({ children: [ new Paragraph("") ] }),
                ],
            }),
        ];

    });

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: { top: cm(1.27), bottom: cm(1.27), left: cm(1.27), right: cm(1.27) }
                }
            },
            children: [
                // ========== 文章部分 ==========
                ...article.split("\n").filter(p => p.trim() !== "").map(p =>
                    new Paragraph({
                        alignment: AlignmentType.JUSTIFIED,
                        indent: { firstLine: cm(0.74) },
                        spacing: { line: 276 },
                        children: [
                            new TextRun({
                                text: p,
                                font: "Times New Roman",
                                size: 28,
                            })
                        ]
                    })
                ),

                // 空行
                new Paragraph(""),

                // ✅ ✅ ✅ 改成 1張大表格 ✅ ✅ ✅
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: "None", size: 0, color: "FFFFFF" },
                        bottom: { style: "None", size: 0, color: "FFFFFF" },
                        left: { style: "None", size: 0, color: "FFFFFF" },
                        right: { style: "None", size: 0, color: "FFFFFF" },
                        insideHorizontal: { style: "None", size: 0, color: "FFFFFF" },
                        insideVertical: { style: "None", size: 0, color: "FFFFFF" },
                    },
                    rows: allRows
                })

            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    const now = new Date();
    const filename = `readingAI${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.docx`;
    saveAs(blob, filename);
}
