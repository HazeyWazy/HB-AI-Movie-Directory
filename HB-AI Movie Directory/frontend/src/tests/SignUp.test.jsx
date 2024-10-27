import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from 'react';
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import SignUp from "../components/SignUp";

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

global.fetch = vi.fn();

const renderSignUp = async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <SignUp darkMode={false} />
      </BrowserRouter>
    );
  });
};

describe('SignUp Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockReset();
  });

  it('renders signup form correctly', async () => {
    await renderSignUp();
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('handles form validation', async () => {
    await renderSignUp();
    
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // HTML5 validation should prevent submission of empty required fields
    expect(screen.getByLabelText(/full name/i)).toBeInvalid();
    expect(screen.getByLabelText(/email address/i)).toBeInvalid();
    expect(screen.getByLabelText(/password/i)).toBeInvalid();
  });

  it('handles successful registration', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Registration successful' })
      })
    );

    await renderSignUp();

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), 
        { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/email address/i), 
        { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), 
        { target: { value: 'password123' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });
  });

  it('handles registration failure with existing email', async () => {
    const errorMessage = 'Email already registered';
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: errorMessage })
      })
    );

    await renderSignUp();

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), 
        { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/email address/i), 
        { target: { value: 'existing@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), 
        { target: { value: 'password123' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('handles network errors', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    await renderSignUp();

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), 
        { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/email address/i), 
        { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), 
        { target: { value: 'password123' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
    });
  });

  it('navigates to sign in page when clicking sign in link', async () => {
    await renderSignUp();
    
    expect(screen.getByText('Sign in').closest('a')).toHaveAttribute('href', '/signin');
  });

  it('shows loading animation on image load', async () => {
    await renderSignUp();
    
    await act(async () => {
      // Wait for the animation timeout
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    const image = screen.getByAltText('Movies');
    expect(image.className).toContain('translate-x-0');
  });
});