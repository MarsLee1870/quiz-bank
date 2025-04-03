// api/lib/exportVocabAItoWord.js
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from "docx";


function cm(n) { return n * 567; } // cm轉twip

export async function exportVocabAItoWord(questions) {
    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: { top: cm(1.27), bottom: cm(1.27), left: cm(1.27), right: cm(1.27) }
                }
            },
            children: questions.map((q, idx) => {
                // ===== 可調參數 =====
                const questionNumberWidth = cm(2); // 題號欄寬
                const choiceCellWidths = [cm(3.5), cm(3.5), cm(3.5), cm(3.5)];
                const firstEmptyCellWidth = cm(2);
                const questionIndent = 50;

                // ===== 表格 =====
                const questionTable = new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: "None", size: 0, color: "FFFFFF" },
                        bottom: { style: "None", size: 0, color: "FFFFFF" },
                        left: { style: "None", size: 0, color: "FFFFFF" },
                        right: { style: "None", size: 0, color: "FFFFFF" },
                        insideHorizontal: { style: "None", size: 0, color: "FFFFFF" },
                        insideVertical: { style: "None", size: 0, color: "FFFFFF" },
                    },
                    rows: [
                        // 題號 + 題目
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
                                                    text: q.answerLetter,
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
                                            indent: { left: questionIndent },
                                            children: [
                                                new TextRun({
                                                    text: q.question,
                                                    font: "Times New Roman",
                                                    size: 28,
                                                }),
                                            ],
                                        }),
                                    ],
                                    columnSpan: 4,
                                }),
                            ],
                        }),
                        // 四選項
                        new TableRow({
                            children: [
                                new TableCell({
                                    width: { size: firstEmptyCellWidth, type: WidthType.DXA },
                                    children: [new Paragraph("")],
                                }),
                                ...[0, 1, 2, 3].map(i => new TableCell({
                                    width: { size: choiceCellWidths[i], type: WidthType.DXA },
                                    children: [
                                        new Paragraph({
                                            spacing: { line: 276 },
                                            children: [
                                                new TextRun({
                                                    text: `(${String.fromCharCode(65 + i)}) ${q.options[i]}`,
                                                    font: "Times New Roman",
                                                    size: 28,
                                                }),
                                            ],
                                        }),
                                    ],
                                })),
                            ],
                        }),
                    ],
                });

                return [questionTable];
            }).flat(),
        }],
    });

    const blob = await Packer.toBlob(doc);
    return blob;

}


