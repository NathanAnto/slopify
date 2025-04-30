import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const app = express()
const port = 4000

app.use(cors({
	origin: 'http://localhost:3000'
})); // Allow all origins by default (use carefully!)

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get("/events", async (req, res) => {
    // res.send(eventsData);
    try {
        await client.connect();
        const db = client.db();
        const eventsCollection = db.collection('events');
        const events = await eventsCollection.find().toArray();
        res.json(events);
    } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        res.status(500).json({ error: 'Impossible de récupérer les événements' });
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`Slopify listening on port ${port}`)
})