export default function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Hiermee haal je CORS weg
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end(); // Reageer op OPTIONS-verzoek (CORS preflight)
    }

    if (req.method === "POST") {
        res.json({ message: "POST ontvangen!", data: req.body });
    } else {
        res.status(405).json({ error: "Alleen POST toegestaan" });
    }
}
