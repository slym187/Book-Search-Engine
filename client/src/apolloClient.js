// src/apolloClient.js

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react'; // Import from react to use with React
import { setContext } from '@apollo/client/link/context';

// Create an HTTP link to the GraphQL server
const httpLink = createHttpLink({
  uri: 'http://localhost:3001/graphql', // Ensure this matches your GraphQL server endpoint
});

// Middleware to add the authentication token to headers
const authLink = setContext((_, { headers }) => {
  // Get the token from local storage
  const token = localStorage.getItem('id_token'); // Replace 'id_token' with the key you're using to store your JWT
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Combine the auth link with the HTTP link
const link = authLink.concat(httpLink);

// Create the Apollo Client instance
const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export { ApolloProvider, client };

