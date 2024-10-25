const { register, login, logout, getUserInfo } = require('../controllers/authController');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

jest.mock('../models/User');
jest.mock('jsonwebtoken');

describe('Authentication Test', () => {
  let req, res;
  const mockToken = 'mock_jwt_token';

  beforeEach(() => {
    req = {
      body: {},
      cookies: {
        token: mockToken
      },
      user: { userId: 'mock_user_id' },
      get: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      User.findOne.mockResolvedValue(null);
      const mockSave = jest.fn().mockResolvedValue();
      User.mockImplementation(() => ({ save: mockSave }));

      await register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "User registered successfully" });
    });

    it('should handle missing required fields - no fields', async () => {
      req.body = {};

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Missing required fields",
        details: {
          name: "Name is required",
          email: "Email is required",
          password: "Password is required"
        }
      });
    });

    it('should handle missing required fields - partial fields', async () => {
      req.body = { name: 'Test User' }; // Missing email and password

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Missing required fields",
        details: {
          name: null,
          email: "Email is required",
          password: "Password is required"
        }
      });
    });

    it('should handle existing email', async () => {
      req.body = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      };
      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email already registered" });
    });

    it('should handle database errors', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      User.findOne.mockRejectedValue(new Error('Database error'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('login', () => {
    beforeEach(() => {
      jwt.sign.mockReturnValue(mockToken);
    });

    it('should login successfully with correct credentials', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'correct_password'
      };
      const mockUser = {
        _id: 'user_id',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(true)
      };
      User.findOne.mockResolvedValue(mockUser);

      await login(req, res);

      expect(mockUser.comparePassword).toHaveBeenCalledWith('correct_password');
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'user_id' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        mockToken,
        expect.objectContaining({
          httpOnly: true,
          secure: expect.any(Boolean)
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful",
        token: mockToken
      });
    });

    it('should handle non-existent user', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      User.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
    });

    it('should handle incorrect password', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrong_password'
      };
      const mockUser = {
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(false)
      };
      User.findOne.mockResolvedValue(mockUser);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
    });

    it('should handle missing credentials', async () => {
      req.body = {};

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
    });

    it('should handle database errors during login', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      User.findOne.mockRejectedValue(new Error('Database error'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('logout', () => {
    it('should successfully logout and clear cookie', async () => {
      await logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith("token");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        message: "Logout successful" 
      });
    });

    it('should succeed even if no token cookie exists', async () => {
      req.cookies = {};

      await logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith("token");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        message: "Logout successful" 
      });
    });
  });

  describe('getUserInfo', () => {
    it('should return user information successfully', async () => {
      const mockUser = {
        _id: 'user_id',
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Test bio'
      };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await getUserInfo(req, res);

      expect(User.findById).toHaveBeenCalledWith('mock_user_id');
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle non-existent user', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await getUserInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it('should handle missing user ID in request', async () => {
      req.user = {};

      await getUserInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ 
        error: "Unauthorized: User not authenticated" 
      });
    });

    it('should handle database errors', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await getUserInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });
});