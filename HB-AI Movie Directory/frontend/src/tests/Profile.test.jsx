import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Profile from "../components/Profile";
import * as UserContext from '../context/UserContext';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => 'mock-token'),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock URL utilities with detailed tracking
const mockUrls = new Set();
const mockCreateObjectURL = vi.fn((blob) => {
  const url = `blob:${Math.random()}`;
  mockUrls.add(url);
  return url;
});
const mockRevokeObjectURL = vi.fn((url) => {
  mockUrls.delete(url);
});

global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

const mockUser = {
  name: 'Test User',
  bio: 'Test Bio',
  profilePicture: 'test-profile-url'
};

const mockUpdateUser = vi.fn();

// Use fake timers for alert message testing
vi.useFakeTimers();

describe('Profile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockReset();
    mockUrls.clear();
    vi.spyOn(UserContext, 'useUser').mockImplementation(() => ({
      user: mockUser,
      updateUser: mockUpdateUser
    }));
  });

  afterEach(() => {
    mockUrls.clear();
    vi.clearAllTimers();
  });

  it('renders loading state when user is null', async () => {
    vi.spyOn(UserContext, 'useUser').mockImplementation(() => ({
      user: null,
      updateUser: mockUpdateUser
    }));

    render(<Profile />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Hang tight, your profile is on the way')).toBeInTheDocument();
  });

  it('renders user profile data correctly', async () => {
    render(<Profile />);

    expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue('Test User');
    expect(screen.getByLabelText(/bio/i)).toHaveValue('Test Bio');
    expect(screen.getByAltText('Profile')).toHaveAttribute('src', 'test-profile-url');
  });

  it('handles profile update successfully', async () => {
    fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: 'Profile updated' })
    }));

    render(<Profile />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'Updated Name' }
      });
      fireEvent.change(screen.getByLabelText(/bio/i), {
        target: { value: 'Updated Bio' }
      });
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /update profile/i }));
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/profile'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            name: 'Updated Name',
            bio: 'Updated Bio'
          })
        })
      );
      expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
    });
  });

  it('handles profile picture upload successfully', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    
    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Profile updated' })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ profilePicture: 'new-image-url' })
      }));

    render(<Profile />);

    await act(async () => {
      const fileInput = screen.getByLabelText(/change image/i);
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const createdUrl = mockCreateObjectURL.mock.results[0].value;
    expect(screen.getByAltText('Profile')).toHaveAttribute('src', createdUrl);

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /update profile/i }));
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/profile/picture'),
        expect.objectContaining({
          method: 'POST'
        })
      );
      expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
    });
  });

  it('handles failed profile update', async () => {
    fetch.mockImplementationOnce(() => Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error: 'Update failed' })
    }));

    render(<Profile />);

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /update profile/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('An error occurred while updating profile')).toBeInTheDocument();
      expect(mockUpdateUser).toHaveBeenCalledWith(mockUser);
    });
  });

  it('handles failed image upload', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    
    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Profile updated' })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: false
      }));

    render(<Profile />);

    await act(async () => {
      const fileInput = screen.getByLabelText(/change image/i);
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /update profile/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('An error occurred while updating profile')).toBeInTheDocument();
      expect(mockUpdateUser).toHaveBeenCalledWith(expect.objectContaining({
        profilePicture: mockUser.profilePicture
      }));
    });
  });

  it('shows and hides alert messages', async () => {
    fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' })
    }));

    render(<Profile />);

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /update profile/i }));
    });

    expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText('Profile updated successfully')).not.toBeInTheDocument();
  });

  it('disables submit button while updating', async () => {
    fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(<Profile />);

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /update profile/i }));
    });

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Updating...')).toBeInTheDocument();
  });

  it('cleans up image URLs on unmount', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    let createdUrl;

    // Render and get unmount function
    const { unmount } = render(<Profile />);

    // Upload file
    await act(async () => {
      const fileInput = screen.getByLabelText(/change image/i);
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    // Wait for URL creation
    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
      createdUrl = mockCreateObjectURL.mock.results[0].value;
      expect(mockUrls.has(createdUrl)).toBe(true);
    });

    // Unmount component
    await act(async () => {
      unmount();
    });

    // Wait for cleanup
    await waitFor(() => {
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(createdUrl);
      expect(mockUrls.size).toBe(0);
    });
  });

  it('cleans up previous URL when uploading new image', async () => {
    const file1 = new File(['test1'], 'test1.png', { type: 'image/png' });
    const file2 = new File(['test2'], 'test2.png', { type: 'image/png' });
    let firstUrl;

    render(<Profile />);

    // Upload first file
    await act(async () => {
      const fileInput = screen.getByLabelText(/change image/i);
      fireEvent.change(fileInput, { target: { files: [file1] } });
    });

    await waitFor(() => {
      firstUrl = mockCreateObjectURL.mock.results[0].value;
      expect(mockUrls.has(firstUrl)).toBe(true);
    });

    // Upload second file
    await act(async () => {
      const fileInput = screen.getByLabelText(/change image/i);
      fireEvent.change(fileInput, { target: { files: [file2] } });
    });

    await waitFor(() => {
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(firstUrl);
      expect(mockUrls.has(firstUrl)).toBe(false);
    });
  });
});