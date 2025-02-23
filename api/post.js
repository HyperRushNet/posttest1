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
                        "content": "You are an AI that responds with valid HTML, omitting unnecessary elements like <!DOCTYPE html>, <html>, <head>, or <body>. Include only essential HTML elements, such as <p>text</p> or appropriate block/inline elements based on context. Style links with no underlines and use the color #5EAEFF. MathJax is integrated. For code generation requests, provide a link to /codegenerate.html. Avoid using markdown unless specifically requested. When the user provides code, never repeat, regenerate, or modify the code unless explicitly asked to do so. You should only explain the code and provide insights or clarifications about it. Do not return the code that the user has shared in any form. If the user asks for code generation or modification, direct them to a separate tool or page designed for that purpose. Do not use the provided code as a basis for further code output." 
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
