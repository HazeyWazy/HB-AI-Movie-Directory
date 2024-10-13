jest.mock('../../middleware/authenticateToken', () => {
    return (req, res, next) => {
      const jwt = require('jsonwebtoken');
      if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user = { _id: decoded.userId };
          next();
        } catch (error) {
          res.status(401).json({ error: 'Invalid token' });
        }
      } else {
        res.status(401).json({ error: 'No token provided' });
      }
    };
  });