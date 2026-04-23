export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0]) {
      res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
      res.status(200).json({ text: 'Ошибка: ' + JSON.stringify(data) });
    }
  } catch (e) {
    res.status(200).json({ text: 'Ошибка: ' + e.message });
  }
}
