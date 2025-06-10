// tests/integration/myEvents.test.js
import request from 'supertest';
import { MongoClient } from 'mongodb';
import { ApolloServer } from 'apollo-server-express'; // This import might be redundant if app is exported
import typeDefs from '../../graphql/types.js';
import resolvers from '../../graphql/resolvers.js';
import jwt from 'jsonwebtoken';

let app; // The express app instance
let client; // MongoClient instance for the test database
let db; // The database instance for tests
let testUserToken; // JWT token for an authenticated test user

// GraphQL Query/Mutation strings
const EVENTS_QUERY = `
    query Events {
        events {
            _id
            name
            createdBy
        }
    }
`;

const PUBLIC_EVENTS_QUERY = `
    query PublicEvents {
        publicEvents {
            _id
            name
            createdBy
        }
    }
`;

const CREATE_EVENT_MUTATION = `
    mutation CreateEvent($name: String!, $dateFrom: String!, $dateTo: String!, $artists: [JSON], $location: JSON) {
        createEvent(name: $name, dateFrom: $dateFrom, dateTo: $dateTo, artists: $artists, location: $location) {
            _id
            name
            createdBy
            createdAt
        }
    }
`;

beforeAll(async () => {
    // MONGODB_URI and JWT_SECRET will be provided by Docker Compose environment variables
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI environment variable is not set. Please set it for testing.");
        process.exit(1);
    }
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'a_very_secret_test_key_for_jwt_only'; // Fallback if not set by Docker

    // Connect to the test MongoDB instance
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db();

    // Dynamically import the app after setting MONGODB_URI and connecting to DB
    // This ensures that the 'db' instance used by index.js is the test DB.
    const appModule = await import('../../index.js');
    app = appModule.default;

    // Create a test user in the test database and generate a token
    const testUser = {
        _id: 'authTestUserId123',
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'User'
    };
    await db.collection('users').insertOne(testUser);
    testUserToken = jwt.sign({ id: testUser._id, email: testUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
    // Clean up the test database after all tests
    if (db) {
        await db.dropDatabase();
    }
    if (client) {
        await client.close();
    }
});

beforeEach(async () => {
    // Clear the events collection before each test to ensure a clean state
    await db.collection('events').deleteMany({});
});

describe('Event Resolvers Integration Tests', () => {

    // --- Query: events ---
    describe('events query', () => {
        test('should return an empty array if not authenticated', async () => {
            const response = await request(app)
                .post('/graphql')
                .send({ query: EVENTS_QUERY });

            expect(response.statusCode).toBe(200);
            expect(response.body.data.events).toEqual([]);
        });

        test('should return events created by the authenticated user', async () => {
            const userId = 'authTestUserId123';
            await db.collection('events').insertMany([
                { name: 'User Event 1', createdBy: userId, dateFrom: '2025-01-01', dateTo: '2025-01-02', createdAt: new Date() },
                { name: 'User Event 2', createdBy: userId, dateFrom: '2025-02-01', dateTo: '2025-02-03', createdAt: new Date() },
                { name: 'Other User Event', createdBy: 'otherUserId', dateFrom: '2025-03-01', dateTo: '2025-03-05', createdAt: new Date() },
            ]);

            const response = await request(app)
                .post('/graphql')
                .set('Cookie', [`token=${testUserToken}`])
                .send({ query: EVENTS_QUERY });

            expect(response.statusCode).toBe(200);
            expect(response.body.data.events).toHaveLength(2);
            expect(response.body.data.events.every(event => event.createdBy === userId)).toBe(true);
            expect(response.body.data.events.some(event => event.name === 'User Event 1')).toBe(true);
            expect(response.body.data.events.some(event => event.name === 'User Event 2')).toBe(true);
        });

        test('should return an empty array if authenticated but no events for the user', async () => {
            const response = await request(app)
                .post('/graphql')
                .set('Cookie', [`token=${testUserToken}`])
                .send({ query: EVENTS_QUERY });

            expect(response.statusCode).toBe(200);
            expect(response.body.data.events).toEqual([]);
        });
    });

    // --- Query: publicEvents ---
    describe('publicEvents query', () => {
        test('should return an empty array if not authenticated', async () => {
            const response = await request(app)
                .post('/graphql')
                .send({ query: PUBLIC_EVENTS_QUERY });

            expect(response.statusCode).toBe(200);
            expect(response.body.data.publicEvents).toEqual([]);
        });

        test('should return all public events when authenticated', async () => {
            const userId = 'authTestUserId123';
            await db.collection('events').insertMany([
                { name: 'Public Event A', createdBy: userId, dateFrom: '2025-01-01', dateTo: '2025-01-02', createdAt: new Date() },
                { name: 'Public Event B', createdBy: 'anotherUser', dateFrom: '2025-02-01', dateTo: '2025-02-03', createdAt: new Date() },
            ]);

            const response = await request(app)
                .post('/graphql')
                .set('Cookie', [`token=${testUserToken}`])
                .send({ query: PUBLIC_EVENTS_QUERY });

            expect(response.statusCode).toBe(200);
            expect(response.body.data.publicEvents).toHaveLength(2);
            expect(response.body.data.publicEvents.some(event => event.name === 'Public Event A')).toBe(true);
            expect(response.body.data.publicEvents.some(event => event.name === 'Public Event B')).toBe(true);
        });

        test('should return an empty array if no public events exist', async () => {
            const response = await request(app)
                .post('/graphql')
                .set('Cookie', [`token=${testUserToken}`])
                .send({ query: PUBLIC_EVENTS_QUERY });

            expect(response.statusCode).toBe(200);
            expect(response.body.data.publicEvents).toEqual([]);
        });
    });

    // --- Mutation: createEvent ---
    describe('createEvent mutation', () => {
        const eventInput = {
            name: 'Integration Test Festival',
            dateFrom: '2025-10-01',
            dateTo: '2025-10-05',
            artists: [{ _id: 'intArt1', name: 'Integration Artist' }],
            location: { _id: 'intLoc1', name: 'Integration Venue', lon: 30, lat: 40 },
        };

        test('should throw an authentication error if no token is provided', async () => {
            const response = await request(app)
                .post('/graphql')
                .send({
                    query: CREATE_EVENT_MUTATION,
                    variables: eventInput,
                });

            expect(response.statusCode).toBe(200); // Expect 200 for GraphQL errors returned in body
            expect(response.body.errors).toBeDefined();
            expect(response.body.errors[0].message).toContain('Not authenticated');
            const eventsInDb = await db.collection('events').find({}).toArray();
            expect(eventsInDb).toHaveLength(0);
        });

        test('should successfully create an event with valid authentication', async () => {
            const response = await request(app)
                .post('/graphql')
                .set('Cookie', [`token=${testUserToken}`])
                .send({
                    query: CREATE_EVENT_MUTATION,
                    variables: eventInput,
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.errors).toBeUndefined(); // No GraphQL errors
            expect(response.body.data.createEvent).toBeDefined();
            expect(response.body.data.createEvent.name).toBe(eventInput.name);
            expect(response.body.data.createEvent.createdBy).toBe('authTestUserId123');
            expect(response.body.data.createEvent._id).toBeDefined();

            const { ObjectId } = await import('mongodb');
            const createdEvent = await db.collection('events').findOne({ _id: new ObjectId(response.body.data.createEvent._id) });
            expect(createdEvent).toBeDefined();
            expect(createdEvent.name).toBe(eventInput.name);
            expect(createdEvent.createdBy).toBe('authTestUserId123');
        });

        test('should successfully create an event with only required fields', async () => {
            const minimalEventInput = {
                name: 'Minimal Test Event',
                dateFrom: '2025-11-01',
                dateTo: '2025-11-02',
            };

            const response = await request(app)
                .post('/graphql')
                .set('Cookie', [`token=${testUserToken}`])
                .send({
                    query: CREATE_EVENT_MUTATION,
                    variables: minimalEventInput,
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.errors).toBeUndefined();
            expect(response.body.data.createEvent).toBeDefined();
            expect(response.body.data.createEvent.name).toBe(minimalEventInput.name);
            expect(response.body.data.createEvent.artists).toBeUndefined();
            expect(response.body.data.createEvent.location).toBeUndefined();

            const { ObjectId } = await import('mongodb');
            const createdEvent = await db.collection('events').findOne({ _id: new ObjectId(response.body.data.createEvent._id) });
            expect(createdEvent).toBeDefined();
            expect(createdEvent.name).toBe(minimalEventInput.name);
            expect(createdEvent.artists).toBeUndefined();
        });
    });
});