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

            // Hier kun je de logica toevoegen om het bericht te verwerken, bijvoorbeeld filtering
            // Voor nu sturen we de boodschap gewoon door naar de backend

            const response = await fetch('https://aiendpost.vercel.app/apibackend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            // Controleer of de backend-API succesvol is
            if (!response.ok) {
                return res.status(500).send("Fout bij het aanroepen van de backend API.");
            }

            // Verkrijg het antwoord van de backend
            const backendResponse = await response.text();

            // Stuur de tekstuele response van de backend terug naar de client
            res.status(200).send(backendResponse);

        } catch (error) {
            console.error("Fout bij API-aanroep:", error);
            res.status(500).send("Er is iets mis gegaan bij het verwerken van je aanvraag.");
        }
    } else {
        // Als de aanvraag geen POST is
        res.status(405).send("Alleen POST-aanvragen zijn toegestaan.");
    }
}
