const jwt = require('jsonwebtoken');

// Set token secret and expiration date
const secret = process.env.JWT_SECRET || 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // Updated authMiddleware function for Apollo Server context
  authMiddleware: function ({ req = {} }) {
    // Initialize token
    let token = req.query?.token || req.headers?.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (req.headers && req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      console.log('No token provided');
      return req; // Return the request object as is if no token is provided
    }

    try {
      // Verify token and get user data out of it
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data; // Attach user data to request
    } catch (err) {
      console.log('Invalid token', err.message);
    }

    // Return the modified request object
    return req;
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
