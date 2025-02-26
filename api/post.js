export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { message } = req.body;

            // Check if message exists
            if (!message || message.length === 0) {
                console.error("Geen bericht ontvangen.");
                return res.status(400).send("Geen bericht ontvangen.");
            }

            const systemPrompt = "You are an AI that always responds in valid HTML but without unnecessary elements like <!DOCTYPE html>, <html>, <head>, or <body>. Only provide the essential HTML elements, such as <p>text</p>, or other inline and block elements depending on the context. Style links without the underline and #5EAEFF text. Mathjax is integrated.";

            // Setup messages for OpenAI
            const messages = [
                { "role": "system", "content": systemPrompt },
                { "role": "user", "content": message }
            ];

            const response = await fetch('https://text.pollinations.ai/openai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: messages, max_tokens: 100 })
            });

            if (!response.ok) {
                console.error(`Fout bij API-aanroep: ${response.status} - ${response.statusText}`);
                return res.status(500).send("Fout bij het aanroepen van de AI API.");
            }

            const data = await response.json();

            if (data.choices && data.choices.length > 0) {
                const aiMessage = data.choices[0].message.content;
                return res.status(200).send(aiMessage);
            } else {
                console.error("Geen antwoord gevonden in de API response.");
                return res.status(400).send("Geen antwoord gevonden in de AI response.");
            }
        } catch (error) {
            console.error("Fout bij API-aanroep:", error);
            res.status(500).send("Er is iets mis gegaan bij het verwerken van je aanvraag.");
        }
    } else {
        res.status(405).send("Alleen POST-aanvragen zijn toegestaan.");
    }
}
