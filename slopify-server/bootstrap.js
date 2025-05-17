import * as dotenv from 'dotenv'
dotenv.config();

import { MongoClient } from 'mongodb';
import SimpleSchema from 'simpl-schema';
import eventsData from './eventsData.js';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const eventSchema = new SimpleSchema({
  name: { type: String },
  dateFrom: { type: String },
  dateTo: { type: String },
  location: {
    type: Array,
    minCount: 2,
    maxCount: 2,
  },
  'location.$': { type: Number }, // Coordinates should be numbers
  artists: { type: Array, optional: true },
  'artists.$': {
    type: Object
  },
  'artists.$.name': {
    type: String
  }
});

const userSchema = new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email, // Validate email format
  },
  password: {
    type: String,
    min: 6, // Minimum password length
  },
  firstname: {
    type: String,
    optional: true, // Optional field
  },
  lastname: {
    type: String,
    optional: true, // Optional field
  },
});

async function bootstrap() {
  try {
    await client.connect();
    const db = client.db();
    const eventsCollection = db.collection('events');

    for (const eventData of eventsData) {
      // Valider les données avec SimpleSchema avant l'insertion
      try {
        eventSchema.validate(eventData);
        const existingEvent = await eventsCollection.findOne({ name: eventData.name });
        if (!existingEvent) {
          await eventsCollection.insertOne(eventData);
          console.log(`Événement "${eventData.name}" ajouté.`);
        } else {
          console.log(`L'événement "${eventData.name}" existe déjà.`);
        }
      } catch (error) {
        console.error(`Erreur de validation pour "${eventData.name}":`, error.details);
      }
    }

    console.log('Initialisation des événements terminée.');
  } catch (error) {
    console.error('Erreur lors de la connexion ou de l\'initialisation de la base de données:', error);
  } finally {
    await client.close();
  }
}

bootstrap();