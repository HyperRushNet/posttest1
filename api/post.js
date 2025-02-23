export default async function handler(req, res) {
    // CORS-instellingen
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Behandel de OPTIONS-aanvraag (voor CORS)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Verwerk POST-aanvraag
    if (req.method === "POST") {
        try {
            // Haal de berichtinhoud op uit de body van de POST-aanvraag
            const { message } = req.body;
            
            if (!message || message.length === 0) {
                return res.status(400).send("Geen bericht meegegeven.");
            }

            // Limiteer het aantal tekens in de gebruikersinvoer
            const MAX_USER_INPUT_CHARACTERS = 1000; // Maximaal aantal tekens
            const messageLength = message.length; // Aantal tekens in het bericht
            
            if (messageLength > MAX_USER_INPUT_CHARACTERS) {
                return res.status(400).send(`Je invoer is te lang. Maximaal aantal tekens is ${MAX_USER_INPUT_CHARACTERS}.`);
            }

            // Statisch systeembericht voor de AI
            const messages = [
                { 
                    "role": "system", 
                    "content": "You are an AI that always responds in valid HTML but without unnecessary elements like <!DOCTYPE html>, <html>, <head>, or <body>. Only provide the essential HTML elements, such as <p>text</p>, or other inline and block elements depending on the context. Style links without the underline and #5EAEFF text. Mathjax is integrated. When the user wants to generate code, give them a link to /codegenerate.html."
                },
                { 
                    "role": "user", 
                    "content": message // Het bericht van de gebruiker
                }
            ];

            // Verstuur het bericht naar de AI API
            const response = await fetch('https://text.pollinations.ai/openai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages,
                    max_tokens: 100 // Beperk de output van de AI tot 100 tokens
                }),
            });

            if (!response.ok) {
                throw new Error(`API response failed with status: ${response.status}`);
            }

            const data = await response.json();

            // Controleer of er een antwoord is van de API
            if (data.choices && data.choices.length > 0) {
                // Stuur alleen de pure tekst terug zonder JSON
                res.status(200).send(data.choices[0].message.content);
            } else {
                res.status(400).send("Geen keuze gevonden in de API-respons.");
            }
        } catch (error) {
            console.error("Fout gedetailleerd:", error);
            res.status(500).send("Er is een fout opgetreden, probeer het later opnieuw.");
        }
    } else {
        // Als de request niet een POST is, stuur een foutmelding
        res.status(405).send("Alleen POST-aanvragen zijn toegestaan.");
    }
}
