import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Event {
    id: ID!
    title: String!
    description: String
    location: String!
    startTime: String!
    endTime: String!
    isRecurring: Boolean
    recurrenceRule: String
  }

  input EventInput {
    title: String!
    description: String
    location: String!
    startTime: String!
    endTime: String!
    isRecurring: Boolean
    recurrenceRule: String
  }

  type Query {
    events: [Event!]!
    event(id: ID!): Event
    filterEventsByDate(startDate: String, endDate: String): [Event!]!
  }

  type Mutation {
    addEvent(input: EventInput!): Event!
    updateEvent(id: ID!, input: EventInput!): Event!
    deleteEvent(id: ID!): Boolean!
  }
`;
