
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testScrape(id) {
  try {
    const res = await fetch(`https://open.spotify.com/artist/${id}?t=${Date.now()}`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      }
    });
    const html = await res.text();
    console.log('HTML Length:', html.length);
    
    const patterns = [
      /"monthlyListeners":\s*(\d+)/i,
      /"stats":\s*{\s*"monthlyListeners":\s*(\d+)/i,
      /([\d.,\s]+)\s+oyentes\s+mensuales/i,
      /([\d.,\s]+)\s+monthly\s+listeners/i
    ];
    
    for (const p of patterns) {
      const m = html.match(p);
      if (m) console.log('Found with pattern:', p, 'Value:', m[1]);
    }
  } catch (e) {
    console.error(e);
  }
}

// ID de Los Cangri Boys Oficial (necesito buscarlo)
// Supongamos que es 163tK9Wp9u40Y0vZqIDpkE (no, este es Myke Towers)
// El usuario me dio la captura pero no el ID.
// Voy a buscar el ID por nombre primero.
testScrape('0du5Z3Z9FTmBBDSCVrqS8p'); // Shakira como test
