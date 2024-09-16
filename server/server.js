const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const { typeDefs, resolvers } = require('./graphql/schema'); // Adjust the path if necessary
const db = require('./config/connection');
const { authMiddleware } = require('./utils/auth');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3001;

// Configure the Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache: 'bounded', // Set cache to 'bounded' to prevent memory exhaustion attacks
  persistedQueries: false, // Disable persisted queries to avoid vulnerability
  context: ({ req }) => {
    // Use authMiddleware and ensure `req` is passed correctly
    const context = authMiddleware({ req });
    return context;
  },
});

// Start the Apollo Server and apply middleware
server.start().then(() => {
  server.applyMiddleware({ app });

  // Middleware for parsing JSON and form data
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.get('*.js', (req, res, next) => {
    res.setHeader('Content-Type', 'application/javascript');
    next();
  });

  // Serve static assets if in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  // Fallback route handler
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });

  // Connect to MongoDB and start the Express server
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
});
