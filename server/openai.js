// server/openai.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
// 使用環境變數來設定端口
const port = process.env.PORT || 3001;  // 如果沒有設定環境變數 PORT，則默認使用 5173 端口

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // 確保這裡使用的是正確的 OPENAI_API_KEY
});

app.post('/api/openai/vocab-question', async (req, res) => {
    try {
      const { word, partOfSpeech, level, lengthRange } = req.body;
  
      const systemPrompt = {
        role: 'system',
        content: `You are an expert English test question generator. You must strictly follow this JSON format in your reply without any explanation:
  
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "answer": "..."
  }
  
  Rules:
  - The question must include a blank (e.g., "I was _____ for the bus").
  - The correct answer must be: ${word}
  - All options must be the same part of speech: ${partOfSpeech}
  - The sentence must be at **${level}** level, and contain **${lengthRange}** words.
  - The **incorrect options must be at or below the specified CEFR level of ${level}**.
  - Do not add explanations, markdown, or extra formatting. Return pure JSON only.`
      };
  
      const userPrompt = {
        role: 'user',
        content: `Generate 1 unique question using a **new and distinct context** and **subject** from previous ones. 
        The context should be different, such as related to **school**, **work**, **leisure activities**, or **travel**—avoid repeating similar scenarios. 
        The **subject** (the person or thing performing the action) should be varied, and the **adverbs of time** and **place** should be different from previous questions. 
        Ensure the sentence is **natural and commonly used** in **everyday conversation**, not overly formal or rare. 
        The **incorrect options** must be **absurdly inappropriate in context**, meaning they should be **completely illogical**, **contextually irrelevant**, and **have no relation to the topic at hand**.
        Use a variety of sentence structures, including **conditional sentences**, **passive voice**, **questions**, and **imperative sentences** to make the sentence more complex and engaging.`
      };
  
      // 定義篩選邏輯
      const isValidQuestion = (parsed) => {
        const { question, options, answer } = parsed;
        if (!question || !options || options.length !== 4 || !answer) return false;
  
        // 檢查選項的邏輯是否正確
        if (options.some(opt => opt === answer)) return false;
  
        // 檢查是否符合語境邏輯
        const invalidOptions = options.some(opt => {
          // 在這裡添加檢查邏輯，確保選項符合語境
          return ['train', 'swim', 'jump'].includes(opt); // 範例：不合邏輯的選項
        });
        if (invalidOptions) return false;
  
        return true; // 如果所有條件都符合，返回 true
      };
  
      let validQuestion = false;
      let questionData;
  
      // 重試邏輯：直到生成有效的題目
      while (!validQuestion) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages: [systemPrompt, userPrompt],
          temperature: 0.8,
          max_tokens: 400,
        });
  
        const text = response.choices[0].message.content;
        const parsed = JSON.parse(text);
  
        // 檢查生成的題目是否有效
        validQuestion = isValidQuestion(parsed);
        if (validQuestion) {
          questionData = parsed;
        }
      }
  
      res.json(questionData); // 返回有效的題目
  
    } catch (error) {
      console.error('❌ Error:', error.message);
      res.status(500).json({ error: 'Failed to generate question' });
    }
  });
  

// 使用環境變數來設定端口並啟動伺服器
app.listen(port, () => {
  console.log(`✅ OpenAI server running at http://localhost:${port}`);
});
