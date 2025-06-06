import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './src/graphql/schema.js';
import { resolvers } from './src/graphql/resolvers.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/event-scheduler';
const PORT = 4000;

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();

app.use(
  '/graphql',
  cors(),
  bodyParser.json(),
  expressMiddleware(server)
);

await mongoose.connect(MONGO_URI);
console.log('MongoDB Connected');

httpServer.listen(PORT, () => {
  console.log(` Server ready at http://localhost:${PORT}/graphql`);
});
