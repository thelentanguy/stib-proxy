export default async function handler(req, res) {
  // Headers CORS essentiels
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Gérer les requêtes preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Seules les requêtes POST sont acceptées
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method Not Allowed',
      message: 'Only POST requests are supported' 
    });
  }

  try {
    // Validation des paramètres
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Request body is required and must be JSON' 
      });
    }

    const { url, method = 'GET', headers = {}, body } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'URL parameter is required and must be a string' 
      });
    }

    // Vérification que l'URL est bien de l'API STIB
    if (!url.includes('opendata-api.stib-mivb.be')) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Only STIB API requests are allowed' 
      });
    }

    console.log(`[${new Date().toISOString()}] Proxying ${method} ${url}`);

    // Préparation des options de requête
    const fetchOptions = {
      method: method.toUpperCase(),
      headers: {
        'User-Agent': 'STIB-Proxy/1.0',
        'Accept': 'application/json',
        ...headers
      }
    };

    // Ajouter le body pour les requêtes POST/PUT
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      
      // S'assurer que Content-Type est défini pour les requêtes avec body
      if (!fetchOptions.headers['Content-Type']) {
        fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    }

    console.log('Fetch options:', JSON.stringify(fetchOptions, null, 2));

    // Faire la requête vers l'API STIB
    const response = await fetch(url, fetchOptions);
    
    console.log(`Response status: ${response.status} ${response.statusText}`);

    // Lire la réponse
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.
