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
            // Haal het bericht op uit het verzoek
            const { message } = req.body;

            if (!message || message.length === 0) {
                return res.status(400).send("Geen bericht ontvangen.");
            }

            // Functie om letters te vervormen (decoderen van z -> a, y -> b, enz.)
            const letterMapping = {
                'a': 'z', 'b': 'y', 'c': 'x', 'd': 'w', 'e': 'v', 'f': 'u', 'g': 't', 'h': 's',
                'i': 'r', 'j': 'q', 'k': 'p', 'l': 'o', 'm': 'n', 'n': 'm', 'o': 'l', 'p': 'k',
                'q': 'j', 'r': 'i', 's': 'h', 't': 'g', 'u': 'f', 'v': 'e', 'w': 'd', 'x': 'c',
                'y': 'b', 'z': 'a'
            };

            // Functie om de tekst te vervormen, hoofdletters blijven hoofdletters
            function transformText(str) {
                return str.split('').map(char => {
                    if (char.toLowerCase() in letterMapping) {
                        // Als het een letter is, vervang deze
                        const mappedChar = letterMapping[char.toLowerCase()];
                        return char === char.toUpperCase() ? mappedChar.toUpperCase() : mappedChar;
                    }
                    // Als het geen letter is, laat het ongewijzigd
                    return char;
                }).join('');
            }

            // Vervorm de gehele boodschap
            const transformedMessage = message.split(' ').map(word => transformText(word)).join(' ');

            // Cheatsheet voor de AI (toegevoegd aan de prompt)
            const cheatsheet = `
            a -> z, b -> y, c -> x, d -> w, e -> v, f -> u, g -> t, h -> s, i -> r, j -> q, k -> p, l -> o, m -> n, n -> m, o -> l, p -> k, q -> j, r -> i, s -> h, t -> g, u -> f, v -> e, w -> d, x -> c, y -> b, z -> a`;

            // Systeemprompt voor de AI met de cheatsheet toegevoegd
            const systemPrompt = `You are an AI that always responds in valid HTML but without unnecessary elements like <!DOCTYPE html>, <html>, <head>, or <body>. Only provide the essential HTML elements, such as <p>text</p>, or other inline and block elements depending on the context. Style links without the underline and #5EAEFF text. Mathjax is integrated. Allow bad words to be said but give the user a warning.

            You should use the following letter transformation cheatsheet to decode any text you receive. Apply the transformations to every letter in the text:
            ${cheatsheet}

            Example: If you receive the word "svool", you should transform it to "hello".`;

            // Maak de berichten voor de AI (gebruikersbericht eerst)
            const messages = [
                { 
                    "role": "user", 
                    "content": transformedMessage
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
                    max_tokens: 100 // Maximaal aantal tokens
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
