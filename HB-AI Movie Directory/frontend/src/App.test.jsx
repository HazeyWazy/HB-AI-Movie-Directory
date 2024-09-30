import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    // Reset the router to the root path before each test
    window.history.pushState({}, "", "/");
  });

  it("renders the home link", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    const homeLink = screen.getByText(/HOME/i);
    expect(homeLink).toBeDefined();
  });

  it("renders the app title on the home page", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    const titles = screen.getAllByText(/HB-AI Movie Directory/i);
    expect(titles.length).toBeGreaterThan(0);
    expect(titles[0]).toBeDefined();
  });
});
