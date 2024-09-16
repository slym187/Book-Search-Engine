import { useEffect } from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../graphql/queries';
import { REMOVE_BOOK } from '../graphql/mutations';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import { v4 as uuidv4 } from 'uuid';

const SavedBooks = () => {
  // Fetch the user data with Apollo Client
  const { loading, data, error, refetch } = useQuery(GET_ME, {
    onError: (error) => {
      console.error('Error fetching user data:', error.message);
    },
  });

  const [removeBook] = useMutation(REMOVE_BOOK, {
    onError: (error) => {
      console.error('Error deleting book:', error.message);
    },
  });

  const userData = data?.me || {}; // Default to an empty object if data is undefined

  // Log fetched user data for debugging
  useEffect(() => {
    console.log('Fetched user data:', data);
  }, [data]);

  // Function to delete a book from the database
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      console.error('No token found');
      alert('You need to be logged in to delete a book.');
      return false;
    }

    try {
      // Use the removeBook mutation
      const { data } = await removeBook({
        variables: { bookId },
      });

      if (!data || !data.removeBook) {
        throw new Error('Something went wrong with removing the book!');
      }

      // Upon success, remove the book's ID from localStorage
      removeBookId(bookId);
      console.log('Book removed successfully!');

      // Refetch the GET_ME query to update the list of saved books
      await refetch();

    } catch (err) {
      console.error('Error deleting book:', err.message);
    }
  };

  // Handle loading state
  if (loading) return <h2>LOADING...</h2>;

  // Handle any errors
  if (error) {
    console.error('Error:', error.message);
    return <h2>Error loading data...</h2>;
  }

  return (
    <>
      <Container fluid className="text-light bg-dark p-5">
        <h1>Viewing saved books!</h1>
      </Container>
      <Container>
        <h2 className="pt-5">
          {userData.savedBooks?.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks?.map((book) => (
            <Col key={uuidv4()} md="4">
              <Card border="dark">
                {book.image ? (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant="top"
                  />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button
                    className="btn-block btn-danger"
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
