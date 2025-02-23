export default async function handler(req, res) {
    // CORS instellingen
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Verwerken van OPTIONS-aanvraag (voor CORS)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Verwerken van POST-aanvraag
    if (req.method === "POST") {
        try {
            const { message } = req.body;

            if (!message || message.length === 0) {
                return res.status(400).send("No message provided.");
            }

            const MAX_USER_INPUT_CHARACTERS = 100000; // Maximale karakters
            if (message.length > MAX_USER_INPUT_CHARACTERS) {
                return res.status(400).send(`Your input is too long. Maximum allowed characters are ${MAX_USER_INPUT_CHARACTERS}.`);
            }

            const messages = [
                { 
                    "role": "system", 
                    "content": "You are an AI that always responds in valid HTML but without unnecessary elements like <!DOCTYPE html>, <html>, <head>, or <body>. Only provide the essential HTML elements, such as <p>text</p>, or other inline and block elements depending on the context. Style links without the underline and #5EAEFF text. Mathjax is integrated."
                },
                { 
                    "role": "user", 
                    "content": message // The user's message
                }
            ];

            // Retry logic
            const retryLimit = 3;
            let attempts = 0;
            let response;

            while (attempts < retryLimit) {
                try {
                    response = await fetch('https://text.pollinations.ai/openai', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: messages,
                            max_tokens: 100
                        }),
                    });

                    if (response.ok) {
                        break;
                    }

                    throw new Error(`Failed to fetch. Status: ${response.status}`);

                } catch (error) {
                    attempts++;
                    console.error(`Attempt ${attempts} failed:`, error.message);
                    if (attempts >= retryLimit) {
                        return res.status(500).send("Failed to fetch data from the API. The service might be temporarily unavailable.");
                    }
                }
            }

            const data = await response.json();

            if (data.choices && data.choices.length > 0) {
                res.status(200).send(data.choices[0].message.content);
            } else {
                res.status(400).send("No choice found in the API response.");
            }
        } catch (error) {
            console.error("Detailed error:", error);
            res.status(500).send("An error occurred. Please try again later.");
        }
    }

    // Verwerken van GET-aanvraag
    else if (req.method === "GET") {
        try {
            const query = req.query.vraag; // Haal vraag op uit de URL, bijvoorbeeld /hoe snel is het licht
            if (!query || query.length === 0) {
                return res.status(400).send("No query parameter provided.");
            }

            const messages = [
                { 
                    "role": "system", 
                    "content": "You are an AI that always responds in valid HTML but without unnecessary elements like <!DOCTYPE html>, <html>, <head>, or <body>. Only provide the essential HTML elements, such as <p>text</p>, or other inline and block elements depending on the context. Style links without the underline and #5EAEFF text. Mathjax is integrated."
                },
                { 
                    "role": "user", 
                    "content": query // De vraag die uit de URL komt
                }
            ];

            let attempts = 0;
            let response;

            while (attempts < retryLimit) {
                try {
                    response = await fetch('https://text.pollinations.ai/openai', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: messages,
                            max_tokens: 100
                        }),
                    });

                    if (response.ok) {
                        break;
                    }

                    throw new Error(`Failed to fetch. Status: ${response.status}`);

                } catch (error) {
                    attempts++;
                    console.error(`Attempt ${attempts} failed:`, error.message);
                    if (attempts >= retryLimit) {
                        return res.status(500).send("Failed to fetch data from the API. The service might be temporarily unavailable.");
                    }
                }
            }

            const data = await response.json();

            if (data.choices && data.choices.length > 0) {
                res.status(200).send(data.choices[0].message.content);
            } else {
                res.status(400).send("No choice found in the API response.");
            }
        } catch (error) {
            console.error("Detailed error:", error);
            res.status(500).send("An error occurred. Please try again later.");
        }
    }

    // Als de aanvraag geen POST of GET is, stuur een foutmelding
    else {
        res.status(405).send("Method Not Allowed.");
    }
}
