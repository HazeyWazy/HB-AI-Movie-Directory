const { register, login, logout } = require('../controllers/authController');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

jest.mock('../models/User');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      cookies: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn()
    };
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = { name: 'Test User', email: 'test@example.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      const mockSave = jest.fn().mockResolvedValue();
      User.mockImplementation(() => ({
        save: mockSave
      }));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "User registered successfully" });
    });

    it('should return error if email already exists', async () => {
      req.body = { name: 'Test User', email: 'existing@example.com', password: 'password123' };
      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email already registered" });
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      const mockUser = {
        _id: 'user_id',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(true)
      };
      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock_token');

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Login successful", token: 'mock_token' });
    });

    it('should return error for invalid credentials', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      const mockUser = {
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(false)
      };
      User.findOne.mockResolvedValue(mockUser);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
    });
  });

  describe('logout', () => {
    it('should clear token cookie and return success message', () => {
      logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith("token");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Logout successful" });
    });
  });
});