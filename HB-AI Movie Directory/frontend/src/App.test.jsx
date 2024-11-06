import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
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

// Mock window.matchMedia
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

    const { container } = await renderApp();
    
    // Check for desktop navigation
    const desktopNav = container.querySelector('.hidden.md\\:flex');
    expect(desktopNav).toBeInTheDocument();
    
    // Verify specific desktop elements
    within(desktopNav).getByText(/SIGN IN/i);
    within(desktopNav).getByText(/SIGN UP/i);
  });

  it("renders hamburger menu for mobile", async () => {
    // Mock window inner width to simulate mobile view
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));

    const { container } = await renderApp();
    
    // Check for mobile menu button
    const menuButton = screen.getByLabelText('Toggle menu');
    expect(menuButton).toBeInTheDocument();

    // Click menu button
    await act(async () => {
      fireEvent.click(menuButton);
    });

    // Check mobile menu
    const mobileMenu = container.querySelector('.mobile-menu');
    expect(mobileMenu).toHaveClass('open');
    within(mobileMenu).getByText(/SIGN IN/i);
    within(mobileMenu).getByText(/SIGN UP/i);
  });

  it("toggles dark mode", async () => {
    await renderApp();
    
    // Find the desktop dark mode toggle
    const darkModeButton = screen.getByRole("button", { name: /dark mode/i });

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
    const { container } = await renderApp();
    const desktopNav = container.querySelector('.hidden.md\\:flex');
    expect(within(desktopNav).getByText(/SIGN IN/i)).toBeInTheDocument();
    expect(within(desktopNav).getByText(/SIGN UP/i)).toBeInTheDocument();
    expect(within(desktopNav).queryByText(/LOGOUT/i)).not.toBeInTheDocument();
  });

  it("shows logout when logged in", async () => {
    vi.spyOn(UserContextModule, 'useUser').mockReturnValue({
      ...mockUserContext,
      user: { name: "Test User" },
      isLoggedIn: true,
    });

    const { container } = await renderApp();
    const desktopNav = container.querySelector('.hidden.md\\:flex');
    expect(within(desktopNav).getByText(/LOGOUT/i)).toBeInTheDocument();
    expect(within(desktopNav).queryByText(/SIGN IN/i)).not.toBeInTheDocument();
    expect(within(desktopNav).queryByText(/SIGN UP/i)).not.toBeInTheDocument();
  });

  it("handles logout action", async () => {
    vi.spyOn(UserContextModule, 'useUser').mockReturnValue({
      ...mockUserContext,
      user: { name: "Test User" },
      isLoggedIn: true,
    });

    const { container } = await renderApp();
    const desktopNav = container.querySelector('.hidden.md\\:flex');
    const logoutButton = within(desktopNav).getByText(/LOGOUT/i);
    
    await act(async () => {
      fireEvent.click(logoutButton);
    });

    expect(mockUserContext.logout).toHaveBeenCalled();
  });

  it("handles mobile menu state", async () => {
    // Set mobile viewport
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));
  
    const { container } = await renderApp();
    
    // Find menu button using exact class and aria-label
    const menuButton = container.querySelector('button[aria-label="Toggle menu"]');
    expect(menuButton).toBeInTheDocument();
  
    // Initial state
    let mobileMenu = container.querySelector('.mobile-menu');
    expect(mobileMenu.className).toContain('closed');
    expect(mobileMenu.className).not.toContain('open');
  
    // Open menu
    await act(async () => {
      fireEvent.click(menuButton);
    });
  
    // Check open state
    expect(mobileMenu.className).toContain('open');
    expect(mobileMenu.className).not.toContain('closed');
  
    // Click outside by creating a proper click event with closest method
    await act(async () => {
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      });
      
      // Add closest method to the event target
      Object.defineProperty(clickEvent, 'target', {
        value: {
          closest: (selector) => null // simulates clicking outside both menu and button
        }
      });
      
      document.dispatchEvent(clickEvent);
    });
  
    // Check closed state
    await waitFor(() => {
      expect(mobileMenu.className).toContain('closed');
      expect(mobileMenu.className).not.toContain('open');
    });
  });
});