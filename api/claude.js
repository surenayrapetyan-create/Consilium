export default async function handler(req, res) {
  const { prompt } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-7', // 
        max_tokens: 4000,
        temperature: 0.7,
        system: prompt.split('\n\n')[0] || 'Ты — эксперт высокого уровня в Консилиуме.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Claude API error');

    return res.status(200).json({ 
      text: data.content[0].text,
      model: 'Claude' 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
