export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            // Verkrijg het bericht uit de request body
            const { message } = req.body;

            // Controleer of het bericht bestaat
            if (!message || message.length === 0) {
                return res.status(400).send("Geen bericht ontvangen.");
            }

            // Lijst met geblokkeerde woorden
            const forbiddenWords = [
                'nigg', 'nigger', 'nigga', 'bitch', 'bitches', 'bastard', 'shit', 'shitty', 
                'asshole', 'ass', 'faggot', 'fag', 'queer', 'cunt', 'cock', 'dick', 'pussy', 
                'whore', 'slut', 'motherfucker', 'fuck', 'fucking', 'retard', 'stupid', 'dumb', 
                'chink', 'gook', 'spic', 'kike', 'beaner', 'terrorist', 'ISIS', 'al-Qaeda', 
                'rape', 'rapist', 'incest', 'pedophile', 'slave', 'slavery', 'kill', 'suicide', 
                'murder', 'bomb', 'hate', 'hater', 'hating', 'kill yourself', 'violence', 'massacre'
            ];

            // Functie om geblokkeerde woorden te vervangen door emoji's
            const replaceWithEmojis = (word) => {
                const emojiMap = {
                    'a': '🅰️', 'b': '🅱️', 'c': '🅲', 'd': '🅳', 'e': '🅴', 'f': '🅵', 'g': '🅶',
                    'h': '🅷', 'i': '🅸', 'j': '🅹', 'k': '🅺', 'l': '🅻', 'm': '🅼', 'n': '🅽',
                    'o': '🅾️', 'p': '🅿️', 'q': '🆀', 'r': '🆁', 's': '🆂', 't': '🆃', 'u': '🆄',
                    'v': '🆅', 'w': '🆆', 'x': '🆇', 'y': '🆈', 'z': '🆉'
                };
                
                return word.split('').map(letter => emojiMap[letter.toLowerCase()] || letter).join('');
            };

            // Vervang de geblokkeerde woorden
            forbiddenWords.forEach(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                message = message.replace(regex, (match) => replaceWithEmojis(match));
            });

            // System prompt voor de AI
            const systemPrompt = "You are an AI that always responds in valid HTML but without unnecessary elements like <!DOCTYPE html>, <html>, <head>, or <body>. Only provide the essential HTML elements, such as <p>text</p>, or other inline and block elements depending on the context. Style links without the underline and #5EAEFF text. Mathjax is integrated.";

            // Maak de berichten voor de AI
            const messages = [
                { 
                    "role": "system", 
                    "content": systemPrompt
                },
                { 
                    "role": "user", 
                    "content": message
                }
            ];

            // Verstuur het bericht naar de OpenAI API via text.pollinations.ai/openai
            const response = await fetch('https://text.pollinations.ai/openai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages, // Voeg system en gebruikersbericht toe
                    max_tokens: 100 // Maximaal aantal tokens
                })
            });

            // Controleer of de response succesvol was
            if (!response.ok) {
                return res.status(500).send("Fout bij het aanroepen van de AI API.");
            }

            // Verkrijg de JSON data van de response
            const data = await response.json();

            // Controleer of de keuze (AI response) aanwezig is in de data
            if (data.choices && data.choices.length > 0) {
                const aiMessage = data.choices[0].message.content;
                
                // Stuur de AI respons terug naar de client
                res.status(200).send(aiMessage);
            } else {
                res.status(400).send("Geen antwoord gevonden in de AI response.");
            }
        } catch (error) {
            console.error("Fout bij API-aanroep:", error);
            res.status(500).send("Er is iets mis gegaan bij het verwerken van je aanvraag.");
        }
    } else {
        // Als de aanvraag geen POST is, stuur dan een foutmelding
        res.status(405).send("Alleen POST-aanvragen zijn toegestaan.");
    }
}
