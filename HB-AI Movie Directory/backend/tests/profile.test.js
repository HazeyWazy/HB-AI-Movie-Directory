const { getProfile, updateProfile, uploadProfilePicture } = require('../controllers/profileController');
const User = require('../models/User');

jest.mock('../models/User');

describe('Profile Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: 'mock_user_id' },
      body: {},
      file: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Test bio'
      };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await getProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith('mock_user_id');
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle non-existent user', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      req.body = {
        name: 'Updated Name',
        bio: 'Updated bio'
      };
      const mockUser = {
        name: 'Old Name',
        bio: 'Old bio',
        save: jest.fn().mockResolvedValue(true)
      };
      User.findById.mockResolvedValue(mockUser);

      await updateProfile(req, res);

      expect(mockUser.name).toBe('Updated Name');
      expect(mockUser.bio).toBe('Updated bio');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Profile updated successfully",
        user: mockUser
      });
    });

    it('should handle partial updates', async () => {
      req.body = { name: 'Updated Name' };
      const mockUser = {
        name: 'Old Name',
        bio: 'Old bio',
        save: jest.fn().mockResolvedValue(true)
      };
      User.findById.mockResolvedValue(mockUser);

      await updateProfile(req, res);

      expect(mockUser.name).toBe('Updated Name');
      expect(mockUser.bio).toBe('Old bio');
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('uploadProfilePicture', () => {
    it('should upload profile picture successfully', async () => {
      req.file = {
        path: 'uploaded/image/path.jpg'
      };
      const mockUser = {
        profilePicture: '',
        save: jest.fn().mockResolvedValue(true)
      };
      User.findById.mockResolvedValue(mockUser);

      await uploadProfilePicture(req, res);

      expect(mockUser.profilePicture).toBe('uploaded/image/path.jpg');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Profile picture uploaded successfully",
        profilePicture: 'uploaded/image/path.jpg'
      });
    });

    it('should handle missing file', async () => {
      req.file = null;

      await uploadProfilePicture(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No file uploaded" });
    });
  });
});