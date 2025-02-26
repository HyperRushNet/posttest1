export default async function handler(req, res) {
    // CORS-instellingen
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // OPTIONS-verzoek afhandelen voor CORS
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Alleen POST-verzoeken accepteren
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST requests are allowed" });
    }

    try {
        const { vraag } = req.body;

        if (!vraag || vraag.trim() === "") {
            return res.status(400).json({ error: "Vraag mag niet leeg zijn" });
        }

        // Stuur de vraag naar /apibackend
        const response = await fetch("https://example.com/apibackend", { // Vervang door de echte URL
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vraag })
        });

        if (!response.ok) {
            throw new Error(`API-backend gaf een fout: ${response.status}`);
        }

        const data = await response.text(); // API stuurt tekst terug

        // Stuur de ontvangen tekst terug naar de client
        res.status(200).send(data);
    } catch (error) {
        console.error("Fout bij API-verzoek:", error);
        res.status(500).json({ error: "Interne serverfout" });
    }
}
