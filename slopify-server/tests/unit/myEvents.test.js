// tests/unit/myEvents.test.js
import resolvers from '../../graphql/resolvers.js';
import { ObjectId } from 'mongodb';
import { jest } from "@jest/globals";

describe('Event Resolvers Unit Tests', () => {
    let mockDb;
    let mockUser;
    let mockCollection;

    beforeEach(() => {
        mockCollection = {
            find: jest.fn().mockReturnThis(),
            toArray: jest.fn(),
            insertOne: jest.fn(),
            findOne: jest.fn(),
        };
        mockDb = {
            collection: jest.fn(() => mockCollection),
        };
        mockUser = { id: 'testUserId123' };
    });

    // --- Query: events ---
    describe('events query', () => {
        test('should return an empty array if user is not authenticated', async () => {
            const result = await resolvers.Query.events(null, null, { user: null, db: mockDb });
            expect(result).toEqual([]);
            expect(mockDb.collection).not.toHaveBeenCalled();
        });

        test('should return events created by the authenticated user', async () => {
            const mockEvents = [
                { _id: new ObjectId(), name: 'My Event 1', createdBy: 'testUserId123' },
                { _id: new ObjectId(), name: 'My Event 2', createdBy: 'testUserId123' },
            ];
            mockCollection.toArray.mockResolvedValue(mockEvents);

            const result = await resolvers.Query.events(null, null, { user: mockUser, db: mockDb });

            expect(mockDb.collection).toHaveBeenCalledWith('events');
            expect(mockCollection.find).toHaveBeenCalledWith({ createdBy: mockUser.id });
            expect(mockCollection.toArray).toHaveBeenCalled();
            expect(result).toEqual(mockEvents);
        });

        test('should return an empty array if no events are found for the user', async () => {
            mockCollection.toArray.mockResolvedValue([]);

            const result = await resolvers.Query.events(null, null, { user: mockUser, db: mockDb });

            expect(mockDb.collection).toHaveBeenCalledWith('events');
            expect(mockCollection.find).toHaveBeenCalledWith({ createdBy: mockUser.id });
            expect(result).toEqual([]);
        });
    });

    // --- Query: publicEvents ---
    describe('publicEvents query', () => {
        test('should return an empty array if user is not authenticated', async () => {
            const result = await resolvers.Query.publicEvents(null, null, { user: null, db: mockDb });
            expect(result).toEqual([]);
            expect(mockDb.collection).not.toHaveBeenCalled();
        });

        test('should return all public events when authenticated', async () => {
            const mockPublicEvents = [
                { _id: new ObjectId(), name: 'Public Event 1', createdBy: 'otherUser1' },
                { _id: new ObjectId(), name: 'Public Event 2', createdBy: 'otherUser2' },
            ];
            mockCollection.toArray.mockResolvedValue(mockPublicEvents);

            const result = await resolvers.Query.publicEvents(null, null, { user: mockUser, db: mockDb });

            expect(mockDb.collection).toHaveBeenCalledWith('events');
            expect(mockCollection.find).toHaveBeenCalledWith({});
            expect(mockCollection.toArray).toHaveBeenCalled();
            expect(result).toEqual(mockPublicEvents);
        });

        test('should return an empty array if no public events are found', async () => {
            mockCollection.toArray.mockResolvedValue([]);

            const result = await resolvers.Query.publicEvents(null, null, { user: mockUser, db: mockDb });

            expect(mockDb.collection).toHaveBeenCalledWith('events');
            expect(mockCollection.find).toHaveBeenCalledWith({});
            expect(result).toEqual([]);
        });
    });

    // --- Mutation: createEvent ---
    describe('createEvent mutation', () => {
        test('should throw an error if user is not authenticated', async () => {
            await expect(resolvers.Mutation.createEvent(null, {}, { user: null, db: mockDb }))
                .rejects.toThrow('Not authenticated');
            expect(mockDb.collection).not.toHaveBeenCalled();
        });

        test('should successfully create and return a new event', async () => {
            const newEventData = {
                name: 'New Festival',
                dateFrom: '2025-08-01',
                dateTo: '2025-08-03',
                artists: [{ _id: 'art1', name: 'Artist One' }],
                location: { _id: 'loc1', name: 'Venue One', lon: 10, lat: 20 },
            };
            const insertedId = new ObjectId();
            mockCollection.insertOne.mockResolvedValue({ insertedId });

            const result = await resolvers.Mutation.createEvent(null, newEventData, { user: mockUser, db: mockDb });

            expect(mockDb.collection).toHaveBeenCalledWith('events');
            expect(mockCollection.insertOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...newEventData,
                    createdBy: mockUser.id,
                    createdAt: expect.any(Date),
                })
            );
            expect(result).toEqual({ _id: insertedId, ...newEventData, createdBy: mockUser.id, createdAt: expect.any(Date) });
        });

        test('should handle missing optional fields when creating an event', async () => {
            const newEventData = {
                name: 'Minimal Event',
                dateFrom: '2025-09-01',
                dateTo: '2025-09-01',
            };
            const insertedId = new ObjectId();
            mockCollection.insertOne.mockResolvedValue({ insertedId });

            const result = await resolvers.Mutation.createEvent(null, newEventData, { user: mockUser, db: mockDb });

            expect(mockCollection.insertOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: newEventData.name,
                    createdBy: mockUser.id,
                    createdAt: expect.any(Date),
                })
            );
            expect(result).toEqual({ _id: insertedId, ...newEventData, createdBy: mockUser.id, createdAt: expect.any(Date) });
        });
    });
});