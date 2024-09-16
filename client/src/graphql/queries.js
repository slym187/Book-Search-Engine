// src/graphql/queries.js

import { gql } from '@apollo/client';

// Define the GraphQL query to get user data
export const GET_ME = gql`
  query me {
    me {
      _id
      username
      email
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;
