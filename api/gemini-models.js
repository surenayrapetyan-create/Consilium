export default async function handler(req, res) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`);
  const data = await response.json();
  res.status(200).json(data);
}
