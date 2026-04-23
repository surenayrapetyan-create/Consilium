export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt, claude, openai, gemini, mode } = req.body;

  let arbitrPrompt;

  if (mode === 'analysis') {
    arbitrPrompt = `Вопрос который задали трём AI: "${prompt}"

Ответ Claude:
${claude}

Ответ GPT-4o:
${openai}

Ответ Gemini:
${gemini}

Ты — Арбитр консилиума. Проведи анализ:
1. Для каждого ответа укажи плюсы и минусы
2. Выбери лучший ответ и объясни почему
3. Дай финальную рекомендацию`;

  } else {
    arbitrPrompt = `Вопрос который задали трём AI: "${prompt}"

Ответ Claude:
${claude}

Ответ GPT-4o:
${openai}

Ответ Gemini:
${gemini}

Ты — Арбитр консилиума. Синтезируй ключевые идеи из трёх ответов в единый вывод. Выдели где модели согласны, где расходятся. Дай итоговую рекомендацию.`;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: arbitrPrompt }]
    })
  });

  const data = await response.json();
  res.status(200).json({ text: data.content[0].text });
}
