export default async function handler(req, res) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, method, headers, body } = req.body || {};
    
    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }

    console.log('Proxying:', method, url);

    const options = {
      method: method || 'GET',
      headers: headers || {}
    };

    if (body && method !== 'GET') {
      options.body = body;
    }

    const response = await fetch(url, options);
    const data = await response.json();
    
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Proxy error',
      message: error.message 
    });
  }
}
