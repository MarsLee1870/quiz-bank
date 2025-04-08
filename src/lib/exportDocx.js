import { saveAs } from "file-saver";
import {
    Document, Packer, Paragraph, TextRun,
    Table, TableRow, TableCell, WidthType,
} from "docx";

function cm(n) { return n * 567; } // cm 轉 twip

export async function exportVocabularyDocx(questions) {
    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: { top: cm(1.27), bottom: cm(1.27), left: cm(1.27), right: cm(1.27) }
                }
            },
            children: questions.map((q, idx) => {
                // ===== 可調參數 =====
const questionNumberWidth = cm(2.5); // 題號欄寬
const choiceCellWidths = [cm(3.5), cm(3.5), cm(3.5), cm(3.5)]; // 四個選項欄寬，可個別微調
const firstEmptyCellWidth = cm(2); // 選項行的第一格空白欄寬，可調整選項距離題號的距離
const questionIndent = 50; // 題目左縮排，可微調題目離題號的距離

// ===== 表格 =====
const questionTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { // <<<<<< 加這塊就好了
        top: { style: "None", size: 0, color: "FFFFFF" },
        bottom: { style: "None", size: 0, color: "FFFFFF" },
        left: { style: "None", size: 0, color: "FFFFFF" },
        right: { style: "None", size: 0, color: "FFFFFF" },
        insideHorizontal: { style: "None", size: 0, color: "FFFFFF" },
        insideVertical: { style: "None", size: 0, color: "FFFFFF" },
    },
    rows: [
        // === 第一列：題號 + 題目 ===
        new TableRow({
            children: [
                new TableCell({
                    width: { size: questionNumberWidth, type: WidthType.DXA },
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
                                    text: q.newCorrectAnswer,
                                    font: "Times New Roman",
                                    size: 28,
                                    color: "FF0000",
                                    bold: true,
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
                
                new TableCell({
                    children: [
                        new Paragraph({
                            spacing: { line: 276 },
                            indent: { left: questionIndent }, // 題目距離題號的微調
                            children: [
                                new TextRun({
                                    text: q["題目內容"],
                                    font: "Times New Roman",
                                    size: 28,
                                }),
                            ],
                        }),
                    ],
                    columnSpan: 4,
                }),
            ]
        }),
        // === 第二列：空格 + 四個選項 ===
        new TableRow({
            children: [
                new TableCell({
                    width: { size: firstEmptyCellWidth, type: WidthType.DXA },
                    children: [new Paragraph("")], // 第一格空格
                }),
                ...[0, 1, 2, 3].map(i => new TableCell({
                    width: { size: choiceCellWidths[i], type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            spacing: { line: 276 },
                            children: [
                                new TextRun({
                                    text: `(${String.fromCharCode(65 + i)}) ${q.shuffledChoices[i].text}`,
                                    font: "Times New Roman",
                                    size: 28,
                                }),
                            ],
                        }),
                    ],
                })),
            ]
        }),
    ]
});
                return [questionTable];
            }).flat()
        }]
    });

    const blob = await Packer.toBlob(doc);
    // 動態檔名
const now = new Date();
const filename = `vocabulary${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.docx`;

saveAs(blob, filename);
}
