import axios from "axios";

const isLocalhost = typeof window !== 'undefined' && window.location.hostname === "localhost";
const prefix = isLocalhost
    ? "http://localhost:8787/api/reading"    // local 時直接打 local server
    : "/api/functions/reading";               // vercel 自動走 serverless

export async function startGenerateArticle(data) {
    const res = await axios.post(`${prefix}/start-generate-reading-article`, data);
    return res.data;
}

export async function getArticleResult(taskId) {
    const res = await axios.get(`${prefix}/get-article-result?taskId=${taskId}`);
    return res.data;
}

export async function startGenerateQuestions(data) {
    const res = await axios.post(`${prefix}/start-generate-questions`, data);
    return res.data;
}

export async function getQuestionResult(taskId) {
    const res = await axios.get(`${prefix}/get-question-result?taskId=${taskId}`);
    return res.data;
}
