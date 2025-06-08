import { ObjectId } from "mongodb";

const resolvers = {
  Query: {
    events: async (_, __, { user, db }) => {
      if (!user) throw new Error("Not authenticated");

      return await db.collection("events").find({ createdBy: user.id }).toArray();
    },

    publicEvents: async (_, __, { user, db }) => {
      if (!user) throw new Error("Not authenticated");

      return await db.collection("events").find({}).toArray();
    },

    searchArtist: async (_, { name }, { user, db, spotifyToken }) => {
      if (!user) throw new Error("Not authenticated");
      if (!spotifyToken) throw new Error("Spotify token is required");
      if(name === "") return []; // Return empty array if name is empty

      console.log(`Searching for artist: ${name} with token: ${spotifyToken}`);
      
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist`, {
        headers: {
          Authorization: `Bearer ${spotifyToken}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch artist suggestions from Spotify");
      }
      const data = await response.json();
      if (data.artists && data.artists.items.length > 0) {
        return data.artists.items.map(artist => ({
          _id: artist.id,
          href: artist.href,
          imageUrl: artist.images.length > 0 ? artist.images[0].url : null,
          name: artist.name,
        }));
      }
      return []; // Return an empty array if no suggestions found
    },

    user: async (_, { id }, { user, db }) => {
      if (!user) return null;
      return await db.collection("users").findOne({ _id: new ObjectId(id) });
    },
  },

  Mutation: {
    createEvent: async (_, args, { user, db }) => {
      if (!user) throw new Error("Not authenticated");

      const event = {
        ...args,
        createdBy: user.id,
        createdAt: new Date(),
      };

      const { insertedId } = await db.collection("events").insertOne(event);
      return { _id: insertedId, ...event };
    },

    updateEvent: async (_, { eventId, ...rest }, { user, db }) => {
      const _id = new ObjectId(eventId);
      const event = await db.collection("events").findOne({ _id });

      if (!event || event.createdBy.toString() !== user.id.toString()) {
        throw new Error("Unauthorized");
      }

      await db.collection("events").updateOne(
        { _id },
        { $set: { ...rest } }
      );

      return await db.collection("events").findOne({ _id });
    },

    deleteEvent: async (_, { eventId }, { user, db }) => {
      if (!user) throw new Error("Not authenticated!");

      if (!ObjectId.isValid(eventId)) {
        throw new Error("Invalid event ID");
      }

      const _id = new ObjectId(eventId);
      const event = await db.collection("events").findOne({ _id });

      if (!event) {
        throw new Error("Event not found");
      }

      if (event.createdBy !== user.id) {
        throw new Error("Not authorized to delete this event");
      }

      await db.collection("events").deleteOne({ _id });
      return true;
    },
  },
};

export default resolvers;