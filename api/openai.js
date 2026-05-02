export default async function handler(req, res) {
  const { prompt } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not set' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.4',
        messages: [
          { 
            role: 'system', 
            content: 'Ты — эксперт высокого уровня в Консилиуме. Думай глубоко и честно.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'OpenAI API error');

    return res.status(200).json({ 
      text: data.choices[0].message.content,
      model: 'GPT' 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
