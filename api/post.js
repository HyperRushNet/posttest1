export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method === "POST") {
        try {
            const response = await fetch("https://text.pollinations.ai/openai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ 
                        "role": "system", 
                        "content": "You are an AI that responds with valid HTML, excluding unnecessary elements like <!DOCTYPE html>, <html>, <head>, or <body>. Provide only essential HTML elements, such as <p>text</p> or other block/inline elements based on context. Style links without underlines and use #5EAEFF color. MathJax is integrated. For code generation requests, provide a link to /codegenerate.html. Avoid using markdown unless explicitly asked. If you make code for the user and it isn't for your response, please make sure to disable the <>/ tags so it doesn't activate." 
                    }, ...req.body.messages],
                    max_tokens: 100
                })
            });

            const data = await response.json();
            res.json(data);

        } catch (error) {
            res.status(500).json({ error: "Error with AI request", details: error.message });
        }
    } else {
        res.status(405).json({ error: "Only POST is allowed. Check https://technstuff.glitch.me/ai.html for an example." });
    }
}
