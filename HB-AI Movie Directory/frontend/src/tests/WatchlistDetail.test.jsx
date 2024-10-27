import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from 'react';
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import WatchlistDetail from "../components/WatchlistDetail";

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' })
  };
});

global.fetch = vi.fn();

const mockWatchlist = {
  _id: "1",
  name: "Action Movies",
  movies: [
    {
      imdbID: "tt1234567",
      Title: "Test Movie 1",
      Year: "2023",
      Poster: "test-poster-1.jpg",
      imdbRating: "8.5"
    },
    {
      imdbID: "tt7654321",
      Title: "Test Movie 2",
      Year: "2022",
      Poster: "test-poster-2.jpg",
      imdbRating: "7.5"
    }
  ]
};

const mockLocalStorage = {
  getItem: vi.fn(() => 'mock-token'),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('WatchlistDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockReset();
  });

  const renderWatchlistDetail = async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <WatchlistDetail />
        </BrowserRouter>
      );
    });
  };

  it('shows loading state initially', async () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    
    await renderWatchlistDetail();
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Fetching your watchlist details')).toBeInTheDocument();
  });

  it('renders watchlist details correctly', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ watchlist: mockWatchlist })
      })
    );

    await renderWatchlistDetail();

    await waitFor(() => {
      expect(screen.getByText('Action Movies')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 1 (2023)')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2 (2022)')).toBeInTheDocument();
      expect(screen.getByText('Rating: 8.5/10')).toBeInTheDocument();
      expect(screen.getByText('Rating: 7.5/10')).toBeInTheDocument();
    });
  });

  it('handles empty watchlist', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          watchlist: { 
            _id: "1", 
            name: "Empty Watchlist", 
            movies: [] 
          } 
        })
      })
    );

    await renderWatchlistDetail();

    await waitFor(() => {
      expect(screen.getByText('Empty Watchlist')).toBeInTheDocument();
      expect(screen.getByText('This watchlist is empty.')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch watchlist' })
      })
    );

    await renderWatchlistDetail();

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch watchlist/i)).toBeInTheDocument();
    });
  });

  it('creates correct movie links', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ watchlist: mockWatchlist })
      })
    );

    await renderWatchlistDetail();

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/movie/tt1234567');
      expect(links[1]).toHaveAttribute('href', '/movie/tt7654321');
    });
  });

  it('handles movie removal from watchlist', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ watchlist: mockWatchlist })
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Movie removed successfully' })
        })
      );

    await renderWatchlistDetail();

    await waitFor(() => {
      expect(screen.getAllByLabelText('Remove movie from watchlist')).toHaveLength(2);
    });

    await act(async () => {
      fireEvent.click(screen.getAllByLabelText('Remove movie from watchlist')[0]);
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/watchlist/remove'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ 
          watchlistId: '1', 
          movieId: 'tt1234567' 
        })
      })
    );
  });

  it('handles failed movie removal', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ watchlist: mockWatchlist })
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ 
            error: 'Failed to remove movie from watchlist' 
          })
        })
      );

    await renderWatchlistDetail();

    await waitFor(() => {
      expect(screen.getAllByLabelText('Remove movie from watchlist')).toHaveLength(2);
    });

    await act(async () => {
      fireEvent.click(screen.getAllByLabelText('Remove movie from watchlist')[0]);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to remove movie from watchlist/i))
        .toBeInTheDocument();
    });
  });

  it('handles network errors', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );

    await renderWatchlistDetail();

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
    });
  });

  it('handles missing poster images', async () => {
    const watchlistWithMissingPoster = {
      ...mockWatchlist,
      movies: [{
        ...mockWatchlist.movies[0],
        Poster: 'N/A'
      }]
    };

    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ watchlist: watchlistWithMissingPoster })
      })
    );

    await renderWatchlistDetail();

    await waitFor(() => {
      const img = screen.getByAltText('Test Movie 1');
      expect(img.src).toContain('placeholder');
    });
  });

  it('preserves remaining movies after removal', async () => {
    fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ watchlist: mockWatchlist })
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Movie removed successfully' })
        })
      );

    await renderWatchlistDetail();

    await act(async () => {
      fireEvent.click(screen.getAllByLabelText('Remove movie from watchlist')[0]);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Movie 2 (2022)')).toBeInTheDocument();
      expect(screen.queryByText('Test Movie 1 (2023)')).not.toBeInTheDocument();
    });
  });
});