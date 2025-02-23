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
                        "content": "You are an AI that always responds in valid HTML but without unnecessary elements like <!DOCTYPE html>, <html>, <head>, or <body>. Only provide the essential HTML elements, such as <p>text</p>, or other inline and block elements depending on the context. Style links without the underline and #5EAEFF text. When you return math, return the LaTeX code for MathJax processing." 
                    }, ...req.body.messages],
                    max_tokens: 100
                })
            });

            const data = await response.json();
            const latex = data.choices[0].message.content;

            // Gebruik een externe LaTeX-renderingservice
            const mathjaxApiUrl = `https://quicklatex.com/latex3.f?formula=${encodeURIComponent(latex)}&fsize=12&mode=1&out=1`;

            const mathjaxResponse = await fetch(mathjaxApiUrl);
            const mathjaxData = await mathjaxResponse.json();

            if (mathjaxData && mathjaxData.svg) {
                // Retourneer het SVG-bestand of een andere weergave
                res.json({ math: mathjaxData.svg });
            } else {
                res.status(500).json({ error: "MathJax-verwerking mislukt" });
            }

        } catch (error) {
            res.status(500).json({ error: "Fout bij AI-verzoek", details: error.message });
        }
    } else {
        res.status(405).json({ error: "Only POST is allowed, check https://technstuff.glitch.me/ai.html for an example." });
    }
}
