export default function handler(req, res) {
    if (req.method === "POST") {
        res.json({ message: "Data ontvangen", data: req.body });
    } else {
        res.status(405).json({ error: "Alleen POST toegestaan" });
    }
}
