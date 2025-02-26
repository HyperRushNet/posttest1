// Deze code moet worden geplaatst in een API-handler, bijvoorbeeld in een Next.js functie (bijvoorbeeld in "pages/api/index.js")
export default async function handler(req, res) {
    // CORS-instellingen
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle OPTIONS request (for CORS)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Handle POST request
    if (req.method === "POST") {
        try {
            const { message } = req.body;

            if (!message || message.length === 0) {
                return res.status(400).json({ error: "Geen bericht meegegeven." });
            }

            // Voeg extra logica toe om de ontvangen data te bewerken, bijvoorbeeld:
            const bewerkteMessage = message.replace(/[^a-zA-Z0-9 ]/g, ''); // Verwijder ongewenste tekens

            // Maak de POST-aanroep naar de werkelijke backend
            const response = await fetch("https://aiendpost.vercel.app/apibackend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: bewerkteMessage })
            });

            if (!response.ok) {
                throw new Error(`Fout bij API-aanroep: ${response.status}`);
            }

            // Verkrijg het antwoord van de backend
            const data = await response.text(); // Het antwoord van de backend

            // Stuur het antwoord van de backend terug naar de gebruiker
            res.status(200).json({ response: data });

        } catch (error) {
            console.error("Fout:", error);
            res.status(500).json({ error: "Er ging iets mis met de API-aanroep." });
        }
    } else {
        res.status(405).json({ error: "Alleen POST-verzoeken zijn toegestaan." });
    }
}
