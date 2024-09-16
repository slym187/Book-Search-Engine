import { useState, useEffect } from 'react';
import { GET_ME } from '../graphql/queries';
import { searchGoogleBooks } from '../utils/API';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row
} from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { SAVE_BOOK } from '../graphql/mutations';
import Auth from '../utils/auth';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';
import { v4 as uuidv4 } from 'uuid';

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  const [saveBook, { error }] = useMutation(SAVE_BOOK);

  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  }, [savedBookIds]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await searchGoogleBooks(searchInput);

      if (!response.ok) {
        throw new Error('Something went wrong!');
      }

      const { items } = await response.json();

      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
      }));

      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBook = async (bookId) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
  
    if (!bookToSave) {
      console.error('No book found to save!');
      return;
    }
  
    const token = Auth.loggedIn() ? Auth.getToken() : null;
  
    if (!token) {
      console.error('No token found');
      return false;
    }
  
    try {
      const { data } = await saveBook({
        variables: { bookData: { ...bookToSave } },
        context: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        update: (cache, { data: { saveBook } }) => {
          try {
            if (!saveBook) {
              throw new Error('saveBook response is undefined.');
            }
  
            // Read the existing data from the cache
            const existingData = cache.readQuery({ query: GET_ME });
  
            if (existingData && existingData.me) {
              // Update the cache with the new list
              cache.writeQuery({
                query: GET_ME,
                data: {
                  me: {
                    ...existingData.me,
                    savedBooks: [...existingData.me.savedBooks, bookToSave], // Append the new book directly
                  },
                },
              });
            }
          } catch (e) {
            console.error('Error updating cache after saving book:', e.message);
          }
        },
      });
  
      if (!data || !data.saveBook) {
        throw new Error('Something went wrong with saving the book!');
      }
  
      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
      console.log('Book saved successfully!');
    } catch (err) {
      console.error('Error saving book:', err.message);
    }
  };

  if (error) {
    console.error('Apollo Client Error:', error.message);
    alert('An error occurred while trying to save the book.');
  }

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => (
            <Col md="4" key={uuidv4()}>
              <Card border='dark'>
                {book.image ? (
                  <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  {Auth.loggedIn() && (
                    <Button
                      disabled={savedBookIds?.some((savedBookId) => savedBookId === book.bookId)}
                      className='btn-block btn-info'
                      onClick={() => handleSaveBook(book.bookId)}>
                      {savedBookIds?.some((savedBookId) => savedBookId === book.bookId)
                        ? 'This book has already been saved!'
                        : 'Save this Book!'}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
