export default async function handler(req, res) {
    // CORS instellingen (uitgeschakeld)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle OPTIONS request (voor CORS)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try {
            // Haal de volledige body op (nu kan het elk type inhoud zijn)
            const requestBody = req.body;

            if (!requestBody || Object.keys(requestBody).length === 0) {
                return res.status(400).send("Geen gegevens ontvangen.");
            }

            // Systeem prompt voor de AI
            const systemPrompt = `Extract all information from the received text and format it into a short JSON structure. Return only the JSON without any extra text or explanation.`;

            // Maak het bericht voor de AI
            const messages = [
                { 
                    "role": "user", 
                    "content": JSON.stringify(requestBody)  // Gebruik de hele body als content
                },
                { 
                    "role": "system", 
                    "content": systemPrompt
                }
            ];

            // Verstuur het bericht naar OpenAI via text.pollinations.ai/openai
            const response = await fetch('https://text.pollinations.ai/openai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages, // Voeg systeem- en gebruikersbericht toe
                    max_tokens: 10000 // Maximaal aantal tokens
                })
            });

            // Controleer of de respons succesvol is
            if (!response.ok) {
                return res.status(500).send("Fout bij het aanroepen van de AI API.");
            }

            // Haal de JSON-gegevens op uit de respons
            const data = await response.json();

            // Controleer of de keuze (AI antwoord) aanwezig is in de gegevens
            if (data.choices && data.choices.length > 0) {
                const aiMessage = data.choices[0].message.content;
                
                // Verstuur het AI antwoord terug naar de client
                res.status(200).send(aiMessage);
            } else {
                res.status(400).send("Geen antwoord gevonden in de AI response.");
            }
        } catch (error) {
            console.error("Fout bij API-aanroep:", error);
            res.status(500).send("Er is iets mis gegaan bij het verwerken van je aanvraag.");
        }
    } else {
        // Als het verzoek geen POST is, stuur dan een foutmelding
        res.status(405).send("Alleen POST-aanvragen zijn toegestaan.");
    }
}
