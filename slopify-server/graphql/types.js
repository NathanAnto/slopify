const typeDefs = `
  scalar JSON

  type Event {
    _id: ID!
    name: String!
    dateFrom: String!
    dateTo: String!
    artists: [JSON]
    location: [Float]
    createdBy: ID!
  }

  type User {
    _id: ID!
    email: String!
    firstname: String
    lastname: String
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  type Query {
    events: [Event]
    publicEvents: [Event]
    me: User
    user(id: ID!): User
  }

  type Mutation {
    createEvent(name: String!, dateFrom: String!, dateTo: String!, artists: [JSON], location: [Float]): Event
    updateEvent(eventId: String!, name: String!, dateFrom: String!, dateTo: String!, artists: [JSON], location: [Float]): Event
    deleteEvent(eventId: String!): Boolean

    createUser(email: String!, password: String!): User
    updateUser(userId: String!, email: String!, password: String!): User
    deleteUser(userId: String!): Boolean
  }
`;

export default typeDefs;
