const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const db = require('./config/connection'); // Adjust path as needed
const { typeDefs, resolvers } = require('./graphql/schema'); // Adjust path as needed
const { authMiddleware } = require('./utils/auth'); // Import the updated authMiddleware

const app = express();
const PORT = process.env.PORT || 3001;

// Create a new instance of ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => authMiddleware({ req }), // Pass the request object to authMiddleware
});

// Start the Apollo Server
server.start().then(() => {
  // Apply the Apollo GraphQL middleware and set the path to /graphql
  server.applyMiddleware({ app });

  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../client/build')));

  // The "catchall" handler: for any request that doesn't match above, send back React's index.html file.
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });

  // Connect to the database
  db.once('open', () => {
    console.log('Connected to MongoDB');

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
});

