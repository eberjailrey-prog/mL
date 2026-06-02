export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.redirect('/?error=' + encodeURIComponent(error));
  }

  if (!code) {
    return res.redirect('/?error=no_code');
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.ML_CLIENT_ID);
    params.append('client_secret', process.env.ML_CLIENT_SECRET);
    params.append('code', code);
    params.append('redirect_uri', process.env.ML_REDIRECT_URI);

    const tokenRes = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: params.toString(),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error('ML token error:', tokenData);
      return res.redirect('/?error=' + encodeURIComponent(tokenData.message || 'token_error'));
    }

    const { access_token, refresh_token, expires_in, user_id } = tokenData;

    res.redirect(
      `/?access_token=${encodeURIComponent(access_token)}` +
      `&refresh_token=${encodeURIComponent(refresh_token)}` +
      `&expires_in=${expires_in}` +
      `&user_id=${user_id}`
    );
  } catch (err) {
    console.error('OAuth error:', err);
    res.redirect('/?error=server_error');
  }
}
