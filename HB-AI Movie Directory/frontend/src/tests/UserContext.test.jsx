import { render, waitFor } from "@testing-library/react";
import { act } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserProvider, useUser } from "../context/UserContext";

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

global.fetch = vi.fn();

const TestComponent = () => {
  const context = useUser();
  return (
    <div>
      <div data-testid="user">{context.user?.name || "no user"}</div>
      <div data-testid="logged-in">{context.isLoggedIn.toString()}</div>
      <button onClick={context.login} data-testid="login-btn">
        Login
      </button>
      <button onClick={context.logout} data-testid="logout-btn">
        Logout
      </button>
    </div>
  );
};

const renderUserContext = async () => {
  let rendered;
  await act(async () => {
    rendered = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
  });
  return rendered;
};

describe("UserContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockReset();
  });

  it("provides initial state with no user and not logged in", async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false }));

    const rendered = await renderUserContext();

    await waitFor(() => {
      expect(rendered.getByTestId("user").textContent).toBe("no user");
      expect(rendered.getByTestId("logged-in").textContent).toBe("false");
    });
  });

  it("fetches user info on mount when token exists", async () => {
    const mockUser = { name: "Test User", email: "test@example.com" };
    mockLocalStorage.getItem.mockReturnValue("valid-token");
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser),
      })
    );

    const rendered = await renderUserContext();

    await waitFor(() => {
      expect(rendered.getByTestId("user").textContent).toBe("Test User");
      expect(rendered.getByTestId("logged-in").textContent).toBe("true");
    });
  });

  it("handles logout correctly", async () => {
    mockLocalStorage.getItem.mockReturnValue("valid-token");
    const mockUser = { name: "Test User" };
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser),
      })
    );

    const rendered = await renderUserContext();

    await waitFor(() => {
      expect(rendered.getByTestId("logged-in").textContent).toBe("true");
    });

    await act(async () => {
      rendered.getByTestId("logout-btn").click();
    });

    expect(rendered.getByTestId("user").textContent).toBe("no user");
    expect(rendered.getByTestId("logged-in").textContent).toBe("false");
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("token");
  });
});
