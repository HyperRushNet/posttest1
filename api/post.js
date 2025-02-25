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
            message = message.replace(/[^a-zA-Z0-9 ]/g, ''); // Filter unwanted characters

            // Limit the number of characters in the user input
            const MAX_USER_INPUT_CHARACTERS = 100000; // Maximum characters
            const messageLength = message.length; // Count characters in the message

            if (messageLength > MAX_USER_INPUT_CHARACTERS) {
                return res.status(400).send(`Your input is too long. Maximum allowed characters are ${MAX_USER_INPUT_CHARACTERS}.`);
            }

            // Fetch data from the time API
            const timeResponse = await fetch('https://timeapi-six.vercel.app/api/');
            if (!timeResponse.ok) {
                console.error("Error fetching time info:", timeResponse.status);
                return res.status(500).send("Failed to fetch time information.");
            }

            const timeText = await timeResponse.text(); // Get raw text response

            // Debugging log for the fetched time text
            console.log("Fetched time info:", timeText);

            // Construct the internal message with time data (invisible to user)
            const internalMessage = `This is a message the user does not know about with information for you. This is the current time info: ${timeText}. User message: ${message}`;

            // Construct the system message (for AI)
            const messages = [
                { 
                    "role": "system", 
                    "content": `You are an AI that always responds in valid HTML but without unnecessary elements like <!DOCTYPE html>, <html>, <head>, or <body>. Only provide the essential HTML elements, such as <p>text</p>, or other inline and block elements depending on the context. Style links without the underline and #5EAEFF text. Mathjax is integrated. When the user wants to generate code, give them a link to /codegenerate.html. If the user says a bad word, accept it but give them a warning.`
                },
                { 
                    "role": "user", 
                    "content": internalMessage // Send the internal message with time and user input to the AI
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
