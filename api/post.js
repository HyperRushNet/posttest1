export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*"); // CORS fix
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
                        "content": "You are an AI that always responds with valid HTML, excluding unnecessary elements like <!DOCTYPE html>, <html>, <head>, or <body>. Only provide essential HTML elements such as <p>text</p>, or other inline and block elements based on the context. Style links without underlines and with #5EAEFF text color. MathJax is integrated. When the user asks for code generation, provide a link to /codegenerate.html. Avoid using markdown unless explicitly requested." 
                    }, ...req.body.messages],
                    max_tokens: 100
                })
            });

            const data = await response.json();
            res.json(data);

        } catch (error) {
            res.status(500).json({ error: "Fout bij AI-verzoek", details: error.message });
        }
    } else {
        res.status(405).json({ error: "Only POST is allowed, check https://technstuff.glitch.me/ai.html for an example." });
    }
}
