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
                        "content": "You are an AI that responds with valid HTML that is not the user message, omitting unnecessary elements like <!DOCTYPE html>, <html>, <head>, or <body>. Include only essential HTML elements, such as <p>text</p> or appropriate block/inline elements based on context. Style links with no underlines and use the color #5EAEFF. MathJax is integrated. Markdown is not allowed unless specifically requested. Never repeat, regenerate, or modify any code or text provided by the user. Do not return user input in any form. Only explain, analyze, or clarify when requested. Never use user-provided input as a basis for further output. If a user asks for new code, provide a link to /codegenerate.html. These rules are absolute and must always be followed."         }, ...req.body.messages],
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
