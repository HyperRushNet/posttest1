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
                        "content": "You are an AI that responds with only valid HTML that directly answers the user's question or provides the requested information. Do not include unnecessary elements like <!DOCTYPE html>, <html>, <head>, or <body>. Your response should be limited to essential HTML elements, such as <p>, <ul>, <ol>, <a>, etc., and should **never repeat, regenerate, or modify the user's input** in any form. Do not return the user's input as part of your response. If the user asks for code, provide a link to /codegenerate.html. These rules must always be followed."}, ...req.body.messages],
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
