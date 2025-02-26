// /index.js (homepage van de API)
export default async function handler(req, res) {
    // Controleer of de aanvraag een POST is
    if (req.method === 'POST') {
        try {
            // Verkrijg het bericht uit het aanvraaglichaam
            const { message } = req.body;

            // Controleer of een bericht is verzonden
            if (!message || message.length === 0) {
                return res.status(400).send("Geen bericht ontvangen.");
            }

            // Gebruik de fetch-aanroep die je hebt gegeven naar de backend
            const response = await fetch('https://aiendpost.vercel.app/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });

            // Controleer of de fetch-aanroep succesvol is
            if (!response.ok) {
                return res.status(500).send("Fout bij het aanroepen van de API.");
            }

            // Verkrijg het antwoord van de API als tekst
            const data = await response.text();

            // Voeg de response van de API toe aan het chatgeschiedenis
            // Je kunt dit eventueel naar de frontend sturen, zoals hieronder:
            res.status(200).send(data);

        } catch (error) {
            console.error("Fout bij API-aanroep:", error);
            res.status(500).send("Er is iets mis gegaan bij het verwerken van je aanvraag.");
        }
    } else {
        // Als de aanvraag geen POST is
        res.status(405).send("Alleen POST-aanvragen zijn toegestaan.");
    }
}
