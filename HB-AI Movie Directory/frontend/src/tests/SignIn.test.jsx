import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from 'react';
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import SignIn from "../components/SignIn";
import * as UserContext from '../context/UserContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

global.fetch = vi.fn();

const mockLocalStorage = {
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const mockLogin = vi.fn();
vi.spyOn(UserContext, 'useUser').mockImplementation(() => ({
  login: mockLogin
}));

const renderSignIn = async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <SignIn darkMode={false} />
      </BrowserRouter>
    );
  });
};

describe('SignIn Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockReset();
  });

  it('renders sign in form correctly', async () => {
    await renderSignIn();
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const mockToken = 'test-token';
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: mockToken })
      })
    );

    await renderSignIn();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    });

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(mockLogin).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles failed login', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false }));

    await renderSignIn();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Login failed');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});