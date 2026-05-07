
const id = '49wxwtIqjRKbj0d3eHDMRJ';
const clientId = '72d3c40165884d6396ff2ef86a01ffb1';
const clientSecret = '52a4b60ab1e14ece818cc51309f24d4d';

async function check() {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  });
  const { access_token } = await tokenRes.json();

  const res = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const data = await res.json();
  console.log('Genres:', data.genres);
  
  const relRes = await fetch(`https://api.spotify.com/v1/artists/${id}/related-artists`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const relData = await relRes.json();
  console.log('Related count:', relData.artists?.length);
}

check();
