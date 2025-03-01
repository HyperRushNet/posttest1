export default function handler(req, res) {
  // Voeg CORS-headers toe om CORS-problemen te voorkomen
  res.setHeader('Access-Control-Allow-Origin', '*'); // Sta toegang toe vanaf elk domein
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Sta GET, POST en OPTIONS methoden toe
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Sta Content-Type header toe

  if (req.method === 'OPTIONS') {
    // Als het een OPTIONS-verzoek is, geef een 200-status om CORS-aanvragen te ondersteunen
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { text } = req.body;

    // Het vervangen van elke letter door het corresponderende teken
    const letterMap = {
      'a': '🅰', 'b': '🅱', 'c': '🅲', 'd': '🅳', 'e': '🅴', 'f': '🅵', 'g': '🅶',
      'h': '🅷', 'i': '🅸', 'j': '🅹', 'k': '🅺', 'l': '🅻', 'm': '🅼', 'n': '🅽',
      'o': '🅾', 'p': '🅿', 'q': '🆀', 'r': '🆁', 's': '🆂', 't': '🆃', 'u': '🆄',
      'v': '🆅', 'w': '🆆', 'x': '🆇', 'y': '🆈', 'z': '🆉'
    };

    if (text) {
      const replacedText = text.split('').map(char => {
        return letterMap[char.toLowerCase()] || char; // Als de letter niet bestaat, behouden we het originele teken
      }).join('');

      res.status(200).json({ replacedText });
    } else {
      res.status(400).json({ error: 'No text provided' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
