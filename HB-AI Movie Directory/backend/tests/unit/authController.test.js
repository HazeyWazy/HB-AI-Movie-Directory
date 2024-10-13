const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connect, closeDatabase, clearDatabase } = require('../database/testSetup');

jest.mock('../../middleware/authenticateToken', () => (req, res, next) => {
  req.user = { _id: 'mockedUserId' };
  next();
});

beforeAll(async () => {
  await connect();
  process.env.JWT_SECRET = 'test_secret';
});
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('User registered successfully');
    });

    it('should not register a user with an existing email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'ExistingPassword123!'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user and return a token', async () => {
      const password = 'LoginPassword123!';
      const user = new User({
        name: 'Login User',
        email: 'login@example.com',
        password: password
      });
      await user.save();

      console.log('Created user:', user);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: password
        });

      console.log('Login response:', res.body);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.token).toBeDefined();
    });

    it('should not login with incorrect credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword123!'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should log out a user', async () => {
      const token = jwt.sign({ userId: 'mockedUserId' }, process.env.JWT_SECRET);

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Logout successful');
    });
  });
});