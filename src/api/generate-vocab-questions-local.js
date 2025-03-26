// ✅ 混合格式支援版本：generate-vocab-questions-local.js
// 使用 object-style prompt 設定，改為文字格式輸出以提升穩定性

import { encode } from 'gpt-tokenizer';
import { shuffle } from '../lib/utils';

const MAX_RETRIES = 3;

const systemPrompt = {
  task: "Generate multiple-choice vocabulary questions.",
  requirements: {
    format: "sentence with blank",
    sentence_length: "12-15 words",
    single_blank: true,
    blank_word: "must be the target word",
    target_word_appearance: "exactly once",
    natural_sentence: true,
    word_position: "must be grammatically natural",
    distractors: {
      count: 3,
      type: "same part of speech",
      quality: "clearly incorrect if inserted"
    },
    options_format: "comma-separated list",
    answer_in_options: true,
    output: "text format with clear fields"
  },
  rules: [
    "Use the following format strictly:",
    "QUESTION: ... (must include exactly one '_____')",
    "OPTIONS: option1, option2, option3, option4",
    "ANSWER: correct_option",
    "No explanations, no extra text."
  ],
  input_format: "target word with part of speech, like bake (v.) or quickly (adv.)",
  accepted_pos: [
    "(n.)", "(v.)", "(adj.)", "(adv.)", "(pron.)", "(conj.)", "(prep.)", "(interj.)",
    "(aux.)", "(modal)", "(article)", "(num.)", "(ger.)", "(inf.)", "(to-v.)",
    "(v-ing)", "(v-ed)", "(n-pl.)", "(phr.)", "(idiom)"
  ],
  output_sample: "QUESTION: I love to _____ cookies every weekend.\nOPTIONS: bake, eat, drive, sleep\nANSWER: bake"
};

function parsePhiTextOutput(text) {
  const blocks = text.split(/QUESTION:/).slice(1); // remove the first empty chunk
  const results = [];

  for (const block of blocks) {
    const lines = block.trim().split(/\n+/);
    const questionLine = lines.find(l => l.toUpperCase().startsWith('QUESTION:'));
    const optionsLine = lines.find(l => l.toUpperCase().startsWith('OPTIONS:'));
    const answerLine = lines.find(l => l.toUpperCase().startsWith('ANSWER:'));

    if (!questionLine || !optionsLine || !answerLine) continue;

    const question = questionLine.replace(/QUESTION:/i, '').trim();
    const options = optionsLine.replace(/OPTIONS:/i, '').split(',').map(o => o.trim());
    const answer = answerLine.replace(/ANSWER:/i, '').trim();

    results.push({ question, options, answer });
  }

  return results;
}
function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
export async function generateQuestions({ word, level = "A2", count = 1, model }) {
  const prompt = `${JSON.stringify(systemPrompt)}\n\nGenerate ${count} vocabulary question(s) using the word: ${word}\nLexical level: ${level}`;

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'phi',
      prompt,
      stream: false
    })
  });

  const result = await response.json();
  const raw = result.response || '';

  console.log('📩 回傳內容：', raw);

  const parsedQuestions = [];
  const parsedResults = parsePhiTextOutput(raw);

  for (const parsed of parsedResults) {
    const wordCount = parsed.question.trim().split(/\s+/).length;

    const isBlankAtStart = parsed.question.trim().startsWith('_____');

    const optionsLower = parsed.options.map(o => o.toLowerCase());
    const answerLower = parsed.answer.toLowerCase();

const isValid =
  parsed &&
  typeof parsed.question === 'string' &&
  Array.isArray(parsed.options) &&
  parsed.options.length === 4 &&
  typeof parsed.answer === 'string' &&
  optionsLower.includes(answerLower) &&
  parsed.question.includes('_____') &&
  wordCount >= 10 &&
  wordCount <= 18;

if (isValid) {
  const formattedOptions = parsed.options.map(opt =>
    isBlankAtStart ? capitalize(opt) : opt.toLowerCase()
  );

  const formattedAnswer = isBlankAtStart
    ? capitalize(parsed.answer)
    : parsed.answer.toLowerCase();

  parsedQuestions.push({
    question: parsed.question,
    options: shuffle(formattedOptions),
    answer: formattedAnswer
  });
}
}

console.log(`✅ 成功產出 ${parsedQuestions.length} 題`);
return parsedQuestions;
}
