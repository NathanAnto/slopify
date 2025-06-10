import * as dotenv from 'dotenv'
dotenv.config();

import { MongoClient } from 'mongodb';
import SimpleSchema from 'simpl-schema';
import eventsData from './eventsData.js';
import userData from './userData.js';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const artistSchema = new SimpleSchema({
    __typename: {
        type: String,
        defaultValue: 'Artist',
        optional: true // Made optional as it might be added programmatically
    },
    _id: {
        type: String, // Assuming _id is a string, not ObjectId in client-side schema
        optional: true // Optional if generated on insert
    },
    href: {
        type: String,
        optional: true,
    },
    imageUrl: {
        type: String,
        optional: true,
    },
    name: {
        type: String
    }
});

const locationSchema = new SimpleSchema({
    __typename: {
        type: String,
        defaultValue: 'Location',
        optional: true // Made optional as it might be added programmatically
    },
    _id: {
        type: String, // Assuming _id is a string, not ObjectId
        optional: true // Optional if generated on insert
    },
    name: {
        type: String
    },
    lon: {
        type: Number,
    },
    lat: {
        type: Number,
    }
});

const eventSchema = new SimpleSchema({
    _id: {
        type: String, // Assuming _id is a string, not ObjectId
        optional: true // Optional if generated on insert
    },
    name: {
        type: String
    },
    dateFrom: {
        type: String,
        regEx: /^\d{8}$/ // YYYYMMDD format
    },
    dateTo: {
        type: String,
        regEx: /^\d{8}$/ // YYYYMMDD format
    },
    artists: {
        type: Array
    },
    'artists.$': {
        type: artistSchema
    },
    location: {
        type: locationSchema
    },
    createdBy: {
        type: String, // Assuming this is a string ID
        optional: true // Optional if added on the server
    },
    createdAt: {
        type: String, // Storing as string in "YYYY-MM-DDTHH:mm:ss.sssZ" format
        optional: true // Optional if added on the server
    }
});

const userSchema = new SimpleSchema({
    // '_id': { type: String, optional: true }, // _id for User type
    email: {
        type: String,
    },
    password: {
        type: String,
        min: 6, // Minimum password length
        // This field is specifically for `createUser` and `updateUser` mutations
        // and is not part of the `User` type returned by `me` or `user(id: ID!)` queries.
    },
    firstname: {
        type: String,
        optional: true,
    },
    lastname: {
        type: String,
        optional: true,
    },
});

async function bootstrap() {
    try {
        await client.connect();
        const db = client.db();
        const eventsCollection = db.collection('events');
        const usersCollection = db.collection('users');

        for (const eventData of eventsData) {
            // Valider les données avec SimpleSchema avant l'insertion
            try {
                eventSchema.validate(eventData);
                const existingEvent = await eventsCollection.findOne({ name: eventData.name });
                if (!existingEvent) {
                    await eventsCollection.insertOne(eventData);
                    console.log(`Event "${eventData.name}" created.`);
                } else {
                    console.log(`The event "${eventData.name}" already exists.`);
                }
            } catch (error) {
                console.error(`Validation error for "${eventData.name}":`, error.details);
            }
        }

        for (const user of userData) {
            // Valider les données avec SimpleSchema avant l'insertion
            try {
                userSchema.validate(user);
                const existingUser = await usersCollection.findOne({ name: user.email });
                if (!existingUser) {
                    await usersCollection.insertOne(user);
                    console.log(`User "${user.email}" created.`);
                } else {
                    console.log(`User "${user.email}" already exists.`);
                }
            } catch (error) {
                console.error(`Validation error for "${user.email}":`, error.details);
            }
        }

        console.log('Finish data initialization.');
    } catch (error) {
        console.error('Error during connexion or data initialization:', error);
    } finally {
        await client.close();
    }
}

export { bootstrap };