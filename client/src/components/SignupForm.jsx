import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { ADD_USER } from '../graphql/mutations'; // Ensure this path is correct
import Auth from '../utils/auth'; // Ensure this path is correct

const SignupForm = () => {
  // Set initial form state
  const [userFormData, setUserFormData] = useState({ username: '', email: '', password: '' });
  const [validated] = useState(false); // State for form validation
  const [showAlert, setShowAlert] = useState(false); // State for alert

  // Use useMutation hook for the ADD_USER mutation
  const [addUser, { error, loading }] = useMutation(ADD_USER);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
  
    // Check if form has everything (as per react-bootstrap docs)
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  
    try {
      console.log('Form data being sent:', userFormData);
  
      // Call the addUser mutation with the form data
      const { data } = await addUser({
        variables: {
          username: userFormData.username,
          email: userFormData.email,
          password: userFormData.password,
        },
      });
  
      // Check if data is returned and has the expected structure
      if (data && data.addUser) {
        const token = data.addUser.token;
        Auth.login(token);
      } else {
        throw new Error('Signup failed: no data returned');
      }
    } catch (err) {
      console.error('Error during signup:', err);
      setShowAlert(true);
    }
  
    setUserFormData({
      username: '',
      email: '',
      password: '',
    });
  };
  

  return (
    <>
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        {loading && <p>Loading...</p>}
        <Alert
          dismissible
          onClose={() => setShowAlert(false)}
          show={showAlert || !!error} // Show alert if there is an error
          variant='danger'>
          {error ? `Error: ${error.message}` : 'Something went wrong with your signup!'}
        </Alert>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='username'>Username</Form.Label>
          <Form.Control
            type='text'
            placeholder='Your username'
            name='username'
            onChange={handleInputChange}
            value={userFormData.username}
            required
          />
          <Form.Control.Feedback type='invalid'>Username is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='email'>Email</Form.Label>
          <Form.Control
            type='email'
            placeholder='Your email address'
            name='email'
            onChange={handleInputChange}
            value={userFormData.email}
            required
          />
          <Form.Control.Feedback type='invalid'>Email is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='password'>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Your password'
            name='password'
            onChange={handleInputChange}
            value={userFormData.password}
            required
          />
          <Form.Control.Feedback type='invalid'>Password is required!</Form.Control.Feedback>
        </Form.Group>
        <Button
          disabled={!(userFormData.username && userFormData.email && userFormData.password) || loading}
          type='submit'
          variant='success'>
          Submit
        </Button>
      </Form>
    </>
  );
};

export default SignupForm;
