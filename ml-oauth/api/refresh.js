export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token required' });
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', process.env.ML_CLIENT_ID);
    params.append('client_secret', process.env.ML_CLIENT_SECRET);
    params.append('refresh_token', refresh_token);

    const tokenRes = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: params.toString(),
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.status(400).json({ error: data.message || 'refresh_failed' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'server_error' });
  }
}
