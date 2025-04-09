import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { words, level, countPerWord, lengthRange } = req.body;

  if (!words || !Array.isArray(words) || !level || !countPerWord || !lengthRange) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const taskId = uuidv4();

  const task = {
    taskId,
    type: "generate-vocab-questions", // 🔥 這個一定要有！
    payload: {
      words,         // [{ word: "train", partOfSpeech: "v." }, ...]
      level,
      countPerWord,
      lengthRange,
    },
  };

  const redisRes = await fetch(`https://us1-rest.api.upstash.io/lpush/task_queue`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([JSON.stringify(task)]),
  });

  if (!redisRes.ok) {
    return res.status(500).json({ error: 'Failed to enqueue task' });
  }

  res.status(200).json({ taskId });
}
