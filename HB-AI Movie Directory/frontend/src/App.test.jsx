import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';

// Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
);

// Utility function to render App with Router
const renderApp = () => {
  return render(
    <Router>
      <App />
    </Router>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockClear();
  });

  it('renders welcome message', () => {
    renderApp();
    expect(screen.getByText(/Welcome, Guest!/i)).toBeDefined();
  });

  it('renders navigation links', () => {
    renderApp();
    expect(screen.getByText(/HOME/i)).toBeDefined();
    expect(screen.getByText(/SIGN IN/i)).toBeDefined();
    expect(screen.getByText(/SIGN UP/i)).toBeDefined();
  });

  it('toggles dark mode', () => {
    renderApp();
    const darkModeButton = screen.getByRole('button');
    fireEvent.click(darkModeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    fireEvent.click(darkModeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('searches for movies', async () => {
    renderApp();
    const searchInput = screen.getByPlaceholderText(/What are we watching today?/i);
    const searchForm = searchInput.closest('form');

    fireEvent.change(searchInput, { target: { value: 'Inception' } });
    fireEvent.submit(searchForm);

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('Inception'));
  });

  it('shows login and signup links when not logged in', () => {
    renderApp();
    expect(screen.getByText(/SIGN IN/i)).toBeDefined();
    expect(screen.getByText(/SIGN UP/i)).toBeDefined();
    expect(screen.queryByText(/LOGOUT/i)).toBeNull();
  });

  it('shows logout when logged in', () => {
    localStorage.setItem('token', 'fake-token');
    renderApp();
    expect(screen.getByText(/LOGOUT/i)).toBeDefined();
    expect(screen.queryByText(/SIGN IN/i)).toBeNull();
    expect(screen.queryByText(/SIGN UP/i)).toBeNull();
  });
});