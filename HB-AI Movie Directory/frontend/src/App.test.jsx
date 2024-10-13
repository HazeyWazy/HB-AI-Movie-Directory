import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";

// Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ results: [] }),
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

describe("App Component", () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockClear();
  });

  it("renders welcome message", () => {
    renderApp();
    expect(screen.getByText(/Welcome, Guest!/i)).toBeDefined();
  });

  it("renders navigation links", () => {
    renderApp();
    expect(screen.getByText(/HOME/i)).toBeDefined();
    expect(screen.getByText(/SIGN IN/i)).toBeDefined();
    expect(screen.getByText(/SIGN UP/i)).toBeDefined();
  });

  it("toggles dark mode", async () => {
    renderApp();
    const darkModeButton = screen.getByRole("button");

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
    renderApp();
    const searchInput = screen.getByPlaceholderText(
      /What are we watching today?/i
    );
    const searchForm = searchInput.closest("form");

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "Inception" } });
      fireEvent.submit(searchForm);
    });

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("Inception"));
  });

  it("shows login and signup links when not logged in", () => {
    renderApp();
    expect(screen.getByText(/SIGN IN/i)).toBeDefined();
    expect(screen.getByText(/SIGN UP/i)).toBeDefined();
    expect(screen.queryByText(/LOGOUT/i)).toBeNull();
  });

  it("shows logout when logged in", async () => {
    localStorage.setItem("token", "fake-token");
    await act(async () => {
      renderApp();
    });
    expect(screen.getByText(/LOGOUT/i)).toBeDefined();
    expect(screen.queryByText(/SIGN IN/i)).toBeNull();
    expect(screen.queryByText(/SIGN UP/i)).toBeNull();
  });
});