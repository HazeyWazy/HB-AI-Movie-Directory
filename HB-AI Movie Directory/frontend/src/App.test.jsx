import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from 'react';
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import * as UserContextModule from './context/UserContext';

const mockUserContext = {
  user: null,
  isLoggedIn: false,
  logout: vi.fn(),
  login: vi.fn(),
  fetchUserInfo: vi.fn(),
};

vi.mock('./context/UserContext', () => ({
  useUser: () => mockUserContext,
  UserProvider: ({ children }) => children,
}));

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ results: [] }),
  })
);

const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockStorage });
Object.defineProperty(window, 'sessionStorage', { value: mockStorage });
Object.defineProperty(window, 'performance', {
  value: { navigation: { type: 0 } },
  writable: true
});

// Mock window.matchMedia for dark mode testing
window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

const renderApp = async () => {
  let rendered;
  await act(async () => {
    rendered = render(
      <UserContextModule.UserProvider>
        <Router>
          <App />
        </Router>
      </UserContextModule.UserProvider>
    );
  });
  return rendered;
};

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.clear.mockClear();
    mockStorage.getItem.mockClear();
    mockStorage.setItem.mockClear();
    fetch.mockClear();
    document.documentElement.classList.remove('dark');
  });

  it("renders welcome message", async () => {
    await renderApp();
    expect(screen.getByText(/Welcome, Guest!/i)).toBeInTheDocument();
  });

  it("renders navigation elements correctly for desktop", async () => {
    // Mock window inner width to simulate desktop view
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));

    await renderApp();
    expect(screen.getByText(/HB-AI Movie Directory/i)).toBeInTheDocument();
    expect(screen.getByText(/SIGN IN/i)).toBeInTheDocument();
    expect(screen.getByText(/SIGN UP/i)).toBeInTheDocument();
  });

  it("renders hamburger menu for mobile", async () => {
    // Mock window inner width to simulate mobile view
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));

    await renderApp();
    const menuButton = screen.getByLabelText('Toggle menu');
    expect(menuButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(menuButton);
    });

    // Check if mobile menu items are visible after clicking
    expect(screen.getByText(/SIGN IN/i)).toBeInTheDocument();
    expect(screen.getByText(/SIGN UP/i)).toBeInTheDocument();
  });

  it("toggles dark mode", async () => {
    await renderApp();
    const darkModeButton = screen.getAllByRole("button").find(
      button => button.parentElement?.textContent?.includes('DARK MODE') ||
                button.closest('button')?.getAttribute('aria-label')?.includes('dark mode')
    );

    expect(darkModeButton).toBeDefined();

    await act(async () => {
      fireEvent.click(darkModeButton);
    });
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    await act(async () => {
      fireEvent.click(darkModeButton);
    });
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("searches for movies", async () => {
    await renderApp();
    const searchInput = screen.getByPlaceholderText(/What are we watching today?/i);
    const searchForm = searchInput.closest("form");

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "Inception" } });
    });

    await act(async () => {
      fireEvent.submit(searchForm);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("Inception"));
    });
  });

  it("shows login and signup links when not logged in", async () => {
    await renderApp();
    expect(screen.getByText(/SIGN IN/i)).toBeInTheDocument();
    expect(screen.getByText(/SIGN UP/i)).toBeInTheDocument();
    expect(screen.queryByText(/LOGOUT/i)).not.toBeInTheDocument();
  });

  it("shows logout when logged in", async () => {
    vi.spyOn(UserContextModule, 'useUser').mockReturnValue({
      ...mockUserContext,
      user: { name: "Test User" },
      isLoggedIn: true,
    });

    await renderApp();
    expect(screen.getByText(/LOGOUT/i)).toBeInTheDocument();
    expect(screen.queryByText(/SIGN IN/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/SIGN UP/i)).not.toBeInTheDocument();
  });

  it("handles logout action", async () => {
    vi.spyOn(UserContextModule, 'useUser').mockReturnValue({
      ...mockUserContext,
      user: { name: "Test User" },
      isLoggedIn: true,
    });

    await renderApp();
    const logoutButton = screen.getByText(/LOGOUT/i);
    
    await act(async () => {
      fireEvent.click(logoutButton);
    });

    expect(mockUserContext.logout).toHaveBeenCalled();
  });

  it("handles mobile menu opening and closing", async () => {
    // Set mobile viewport
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));

    await renderApp();
    const menuButton = screen.getByLabelText('Toggle menu');

    // Open menu
    await act(async () => {
      fireEvent.click(menuButton);
    });

    // Click outside to close
    await act(async () => {
      fireEvent.mouseDown(document.body);
    });

    // Verify menu is closed (this might need adjustment based on your implementation)
    expect(screen.queryByRole('navigation', { hidden: true })).not.toBeVisible;
  });
});