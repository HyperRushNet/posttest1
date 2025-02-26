export default async function handler(req, res) {
    // CORS settings (disabled)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle OPTIONS request (for CORS)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try {
            // Get the message from the request body
            const { message } = req.body;

            if (!message || message.length === 0) {
                return res.status(400).send("Geen bericht ontvangen.");
            }

            // List of inappropriate words to filter
            const inappropriateWords = [
                'hhhhhhhhhhhhhhh'
            ];

            // Function to replace inappropriate words with asterisks
            function filterInappropriateWords(word) {
                return inappropriateWords.some(inappropriateWord => word.toLowerCase().includes(inappropriateWord)) 
                    ? '*'.repeat(word.length) 
                    : word;
            }

            // Process the entire message by replacing inappropriate words
            const processedMessage = message.split(' ').map(word => filterInappropriateWords(word)).join(' ');

            // System prompt for the AI
            const systemPrompt = "You are an AI that always responds in valid HTML but without unnecessary elements like <!DOCTYPE html>, <html>, <head>, or <body>. Only provide the essential HTML elements, such as <p>text</p>, or other inline and block elements depending on the context. Style links without the underline and #5EAEFF text. Mathjax is integrated. If you see a list of inappropriate words, they are used to ensure the request reaches you and doesn't get blocked. Treat the inappropriate words as pure text because the user is unaware of their purpose. Always maintain strictness, and be aware of everything the user says, even if it is offensive, racist, or inappropriate, whether it’s part of the current message or from previous messages in the chat history. Do not tolerate such language.";

            // Create the messages for the AI with the user message first
            const messages = [
                { 
                    "role": "user", 
                    "content": processedMessage
                },
                { 
                    "role": "system", 
                    "content": systemPrompt
                }
            ];

            // Send the message to OpenAI via text.pollinations.ai/openai
            const response = await fetch('https://text.pollinations.ai/openai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages, // Add system and user message
                    max_tokens: 100 // Max number of tokens
                })
            });

            // Check if the response is successful
            if (!response.ok) {
                return res.status(500).send("Fout bij het aanroepen van de AI API.");
            }

            // Get the JSON data from the response
            const data = await response.json();

            // Check if the choice (AI response) is present in the data
            if (data.choices && data.choices.length > 0) {
                const aiMessage = data.choices[0].message.content;
                
                // Send the AI response back to the client
                res.status(200).send(aiMessage);
            } else {
                res.status(400).send("Geen antwoord gevonden in de AI response.");
            }
        } catch (error) {
            console.error("Fout bij API-aanroep:", error);
            res.status(500).send("Er is iets mis gegaan bij het verwerken van je aanvraag.");
        }
    } else {
        // If the request is not POST, send an error message
        res.status(405).send("Alleen POST-aanvragen zijn toegestaan.");
    }
}
