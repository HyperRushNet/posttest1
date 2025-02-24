// Functie om ongewenste woorden te filteren en te vervangen door + tussen de karakters
function filterMessage(message) {
    message = message.replace(/[^a-zA-Z0-9 ]/g, ''); // Alleen letters en cijfers behouden
    return message;
}

// Functie om de tijdzone op basis van het IP-adres op te halen
async function getTimeZone() {
    const res = await fetch('https://ipapi.co/json');
    const data = await res.json();
    return data.timezone; // Return the timezone from the IPAPI response
}

export default async function handler(req, res) {
    // CORS settings
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle OPTIONS request (for CORS)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Process POST request
    if (req.method === "POST") {
        try {
            // Get the message from the request body
            let { message } = req.body;

            if (!message || message.length === 0) {
                return res.status(400).send("No message provided.");
            }

            // Filter the message to replace forbidden words
            message = filterMessage(message);

            // Limit the number of characters in the user input
            const MAX_USER_INPUT_CHARACTERS = 100000; // Maximum characters
            const messageLength = message.length; // Count characters in the message

            if (messageLength > MAX_USER_INPUT_CHARACTERS) {
                return res.status(400).send(`Your input is too long. Maximum allowed characters are ${MAX_USER_INPUT_CHARACTERS}.`);
            }

            // Get the user's time zone based on their IP address
            const timezone = await getTimeZone();

            // Get current date and time in the user's time zone
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long' });
            const month = now.toLocaleString('en-US', { month: 'long' });
            const day = String(now.getDate()).padStart(2, '0');
            const year = now.getFullYear();

            const formattedTime = `${dayOfWeek}, ${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;

            // Static system message for the AI with the current date and time
            const messages = [
                { 
                    "role": "system", 
                    "content": `You are an AI that always responds in valid HTML but without unnecessary elements like <!DOCTYPE html>, <html>, <head>, or <body>. Only provide the essential HTML elements, such as <p>text</p>, or other inline and block elements depending on the context. Style links without the underline and #5EAEFF text. Mathjax is integrated. When the user wants to generate code, give them a link to /codegenerate.html. If the user says a bad word, accept it but give them a warning. Current date and time in ${timezone}: ${formattedTime}`
                },
                { 
                    "role": "user", 
                    "content": message // The user's filtered message
                }
            ];

            // Retry logic
            const retryLimit = 3; // Number of retry attempts
            let attempts = 0;
            let response;

            // Retry until the request is successful or we reach the retry limit
            while (attempts < retryLimit) {
                try {
                    response = await fetch('https://text.pollinations.ai/openai', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: messages,
                            max_tokens: 100 // Limit the AI output to 100 tokens
                        }),
                    });

                    if (response.ok) {
                        break; // Exit the loop if the request is successful
                    }

                    throw new Error(`Failed to fetch. Status: ${response.status}`);

                } catch (error) {
                    attempts++;
                    console.error(`Attempt ${attempts} failed:`, error.message);
                    if (attempts >= retryLimit) {
                        return res.status(500).send("Failed to fetch data from the API. The service might be temporarily unavailable, or there may be an issue with your internet connection.");
                    }
                }
            }

            const data = await response.json();

            // Check if there is a response from the API
            if (data.choices && data.choices.length > 0) {
                // Return only the plain text response without JSON
                res.status(200).send(data.choices[0].message.content);
            } else {
                res.status(400).send("No choice found in the API response.");
            }
        } catch (error) {
            console.error("Detailed error:", error);
            res.status(500).send("An error occurred. Please try again later.");
        }
    } else {
        // If the request is not POST, send an error message
        res.status(405).send("Only POST requests are allowed.");
    }
}
