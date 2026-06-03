export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'No token' });

  try {
    const mlRes = await fetch('https://api.mercadolibre.com/users/me', {
      headers: { Authorization: auth }
    });
    const data = await mlRes.json();
    res.status(mlRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'server_error' });
  }
}