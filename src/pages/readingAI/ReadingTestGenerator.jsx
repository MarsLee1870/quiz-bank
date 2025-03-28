import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";

export default function ReadingTestGenerator() {
    const [article, setArticle] = useState("");
    const [questions, setQuestions] = useState("");

    return (
        <div className="relative p-6 space-y-8">

            {/* Header 固定 */}
            <div className="sticky top-0 z-10 relative py-2 border-b border-gray-700 bg-gray-800">
                <h1 className="text-4xl font-bold text-center text-gray-100">AI 閱讀測驗</h1>
                <Button className="absolute right-4 top-2">匯出 Word</Button>
            </div>

            {/* ===== 上下區塊包起來 ===== */}
            <div className="space-y-24">

                {/* ===== 文章區 ===== */}
                <div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h2 className="font-semibold text-2xl">文章設定</h2>

                            {/* 主題 */}
                            <div>
                                <label>主題（必填）</label>
                                <Textarea
                                    placeholder="輸入文章主題"
                                    className="w-full h-48 bg-gray-900 text-gray-100 placeholder-gray-400 border border-gray-600 p-4 rounded resize-none shadow"
                                />
                            </div>

                            {/* 字數 */}
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <label>字數（必填）</label>
                                    <Input placeholder="最小" />
                                </div>
                                <span>~</span>
                                <div className="flex-1">
                                    <label>&nbsp;</label>
                                    <Input placeholder="最大" />
                                </div>
                            </div>

                            {/* 段落數 */}
                            <div>
                                <label>段落數（必填）</label>
                                <Input placeholder="段落數" />
                            </div>

                            {/* CEFR */}
                            <div>
                                <label>CEFR（必填）</label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="選擇 CEFR" /></SelectTrigger>
                                    <SelectContent>
                                        {["A1", "A2", "B1", "B2", "C1", "C2"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 文體 */}
                            <div>
                                <label>文體（可選）</label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="選擇文體" /></SelectTrigger>
                                    <SelectContent>
                                        {["article", "letter", "email", "advertisement", "announcement", "notice", "story", "dialogue", "news"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 語氣 */}
                            <div>
                                <label>語氣（可選）</label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="選擇語氣" /></SelectTrigger>
                                    <SelectContent>
                                        {["neutral", "formal", "informal", "friendly", "enthusiastic", "concerned", "persuasive", "humorous"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 讀者 */}
                            <div>
                                <label>讀者（可選）</label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="選擇讀者" /></SelectTrigger>
                                    <SelectContent>
                                        {["general", "students", "teachers", "parents", "tourists", "customers", "employees", "kids"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 寫文章 */}
                            <Button className="w-full">寫文章</Button>
                        </div>

                        {/* 文章內容 */}
                        <div>
                            <h2 className="font-semibold text-2xl mb-2">文章內容</h2>
                            <div className="border h-[700px] overflow-y-auto p-2 rounded">
                                <pre className="whitespace-pre-wrap">{article || "這裡會顯示 AI 生成的文章"}</pre>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== 題目區 ===== */}
                <div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h2 className="font-semibold text-2xl">題目設定</h2>
                            <div>
                                <label>題數（可填）</label>
                                <Input placeholder="總題數" />
                            </div>

                            {["主旨型", "細節型", "目的型", "架構型", "釋義型", "語氣型", "推論型"].map((type) => (
                                <div key={type}>
                                    <label>{type}（可填）</label>
                                    <Input placeholder={`幾題 ${type}`} />
                                </div>
                            ))}

                            <Button className="w-full">出題</Button>
                        </div>

                        {/* 題目內容 */}
                        <div>
                            <h2 className="font-semibold text-2xl mb-2">題目內容</h2>
                            <div className="border h-[600px] overflow-y-auto p-2 rounded">
                                <pre className="whitespace-pre-wrap">{questions || "這裡會顯示 AI 生成的題目"}</pre>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
