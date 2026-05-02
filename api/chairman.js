const ARBITRATOR_PROMPT = `Ты — Арбитр Консилиума. Твоя единственная задача — создать объективную «карту согласия и расхождений» на основе ответов трёх экспертов (Эксперт А, Эксперт Б, Эксперт В). Порядок ответов перетасован.

Пользовательский запрос:
**Что я уже думаю:** {user_thoughts}
**Контекст:** {context}
**Последствия ошибки:** {consequences}
**Вопрос:** {question}

Ответы экспертов:
{experts_text}

Критически важные правила:
- НЕ выбирай «победителя» и НЕ голосуй большинством автоматически. Одиночное мнение может быть самым правильным — выделяй такие случаи явно и объясняй почему.
- Будь максимально объективным аналитиком.
- Если один эксперт не ответил — явно укажи это в начале.

Строго соблюдай структуру ответа:

1. **Полное согласие всех трёх экспертов**
2. **Согласие двух экспертов против одного** (укажи, какие именно эксперты и в чём именно)
3. **Существенные расхождения** (все трое разошлись или сильные различия)
4. **Факты и утверждения, подтверждённые минимум двумя источниками**
5. **Ключевые открытые вопросы и зоны неопределённости**
6. **Синтезированные рекомендации арбитра** (твой общий взгляд на основе всей карты, без давления большинства)

Отвечай чётко, структурировано и полезно.`;

export default async function handler(req, res) {
  const { userInput, expertResponses, failedModels } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });
  }

  try {
    let expertsText = '';
    Object.keys(expertResponses).forEach(key => {
      expertsText += `Эксперт ${key}:\n${expertResponses[key]}\n\n`;
    });

    const fullPrompt = ARBITRATOR_PROMPT
      .replace('{user_thoughts}', userInput.thoughts || '')
      .replace('{context}', userInput.context || '')
      .replace('{consequences}', userInput.consequences || '')
      .replace('{question}', userInput.question || '')
      .replace('{experts_text}', expertsText);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-7',
        max_tokens: 6000,
        temperature: 0.5,
        messages: [{ role: 'user', content: fullPrompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Chairman API error');

    return res.status(200).json({
      synthesis: data.content[0].text,
      failedModels: failedModels || []
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
