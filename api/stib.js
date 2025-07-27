export default async function handler(req, res) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Répondre aux requêtes OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, method = 'GET', headers = {}, body } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log('Proxy request to:', url);
    console.log('Method:', method);
    console.log('Headers:', headers);

    // Configuration de la requête
    const fetchOptions = {
      method: method,
      headers: {
        ...headers,
        'User-Agent': 'STIB-Proxy/1.0'
      }
    };

    // Ajouter le body seulement pour POST/PUT
    if (method !== 'GET' && body) {
      fetchOptions.body = body;
    }

    // Faire la requête
    const response = await fetch(url, fetchOptions);
    
    console.log('Response status:', response.status);
    
    // Lire la réponse
    const text = await response.text();
    
    // Essayer de parser en JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // Si ce n'est pas du JSON, retourner le texte
      data = { text: text };
    }
    
    // Retourner la réponse avec le bon statut
    return res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message,
      details: error.toString()
    });
  }
}
