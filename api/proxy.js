export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Health check
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'healthy',
      server: 'vercel-proxy',
      timestamp: new Date().toISOString()
    });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const response = await fetch('https://product.3games.io/api/rcmd/recommend_by_config', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'content-type': 'application/json',
        'country-code': 'vn',
        'user-id': '7092998',
        'user-secret-key': '8814b2f17b16451b910dd11f7b11b78e3f11897b847cbfd83d22a4a578639aa1',
        'xb-language': 'vi-VN',
        'Referer': 'https://xworld.info/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    res.status(200).json({
      ...data,
      _proxy_info: {
        server: 'vercel',
        timestamp: new Date().toISOString(),
        status: 'success'
      }
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Proxy failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
