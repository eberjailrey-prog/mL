import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// LOGIN
app.get('/api/login', (req, res) => {
  const clientId = process.env.ML_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.ML_REDIRECT_URI);
  res.redirect(`https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`);
});

// CALLBACK
app.get('/api/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error) return res.redirect('/?error=' + encodeURIComponent(error));
  if (!code) return res.redirect('/?error=no_code');
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.ML_CLIENT_ID);
    params.append('client_secret', process.env.ML_CLIENT_SECRET);
    params.append('code', code);
    params.append('redirect_uri', process.env.ML_REDIRECT_URI);
    const tokenRes = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const data = await tokenRes.json();
    if (!tokenRes.ok) return res.redirect('/?error=' + encodeURIComponent(data.message || 'token_error'));
    res.redirect(`/?access_token=${encodeURIComponent(data.access_token)}&refresh_token=${encodeURIComponent(data.refresh_token)}&expires_in=${data.expires_in}&user_id=${data.user_id}`);
  } catch (err) {
    res.redirect('/?error=server_error');
  }
});

// REFRESH
app.post('/api/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', process.env.ML_CLIENT_ID);
    params.append('client_secret', process.env.ML_CLIENT_SECRET);
    params.append('refresh_token', refresh_token);
    const tokenRes = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const data = await tokenRes.json();
    if (!tokenRes.ok) return res.status(400).json({ error: data.message });
    res.json(data);
  } catch { res.status(500).json({ error: 'server_error' }); }
});

// ME proxy
app.get('/api/me', async (req, res) => {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const mlRes = await fetch('https://api.mercadolibre.com/users/me', { headers: { Authorization: auth } });
    const data = await mlRes.json();
    res.status(mlRes.status).json(data);
  } catch { res.status(500).json({ error: 'server_error' }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
