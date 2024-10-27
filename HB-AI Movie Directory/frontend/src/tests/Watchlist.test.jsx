import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from 'react';
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Watchlist from "../components/Watchlist";

global.fetch = vi.fn();

const mockWatchlists = [
  {
    _id: "1",
    name: "Action Movies",
    movies: ["tt1234567", "tt7654321"]
  },
  {
    _id: "2",
    name: "Sci-Fi",
    movies: ["tt9876543"]
  }
];

const mockLocalStorage = {
  getItem: vi.fn(() => 'mock-token'),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('Watchlist Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockReset();
  });

  const renderWatchlist = async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Watchlist darkMode={false} />
        </BrowserRouter>
      );
    });
  };

  it('shows loading state initially', async () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    
    await renderWatchlist();
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Fetching your watchlists')).toBeInTheDocument();
  });

  it('renders watchlists correctly', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ watchlists: mockWatchlists })
      })
    );

    await renderWatchlist();

    await waitFor(() => {
      expect(screen.getByText('Action Movies')).toBeInTheDocument();
      expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
      expect(screen.getByText('2 movies')).toBeInTheDocument();
      expect(screen.getByText('1 movies')).toBeInTheDocument();
    });
  });

  it('handles empty watchlist state', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ watchlists: [] })
      })
    );

    await renderWatchlist();

    await waitFor(() => {
      expect(screen.getByText('You have no watchlists yet.')).toBeInTheDocument();
    });
  });

  it('opens new watchlist modal', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ watchlists: [] })
      })
    );

    await renderWatchlist();

    await act(async () => {
      fireEvent.click(screen.getByText('+'));
    });

    expect(screen.getByText('New Watchlist')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter watchlist name')).toBeInTheDocument();
  });

  it('creates new watchlist', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ watchlists: [] })
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ watchlist: { name: 'New List', movies: [] } })
        })
      );

    await renderWatchlist();

    await act(async () => {
      fireEvent.click(screen.getByText('+'));
    });

    const input = screen.getByPlaceholderText('Enter watchlist name');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'New List' } });
    });

    const createButton = screen.getByText('Create');
    await act(async () => {
      fireEvent.click(createButton);
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/watchlist'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'New List' })
      })
    );
  });

  it('handles watchlist deletion', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ watchlists: mockWatchlists })
      })
    );

    await renderWatchlist();

    const deleteButtons = await screen.findAllByLabelText('Delete watchlist');
    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/watchlist/1'),
      expect.objectContaining({
        method: 'DELETE'
      })
    );
  });
});