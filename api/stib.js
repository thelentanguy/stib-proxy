export default async function handler(req, res) {
  // Headers CORS pour permettre les requêtes depuis le navigateur
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Répondre aux requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Récupérer les paramètres de la requête
    const { url, method = 'GET', headers = {}, body } = req.body;
    
    // Faire la requête vers l'API STIB
    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: body
    });
    
    // Récupérer la réponse
    const data = await response.json();
    
    // Renvoyer la réponse avec le bon statut
    res.status(response.status).json(data);
    
  } catch (error) {
    // En cas d'erreur
    res.status(500).json({ error: error.message });
  }
}