import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import MovieDetail from "../components/MovieDetail";
import * as UserContext from '../context/UserContext';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'tt1234567' })
  };
});

// Mock global fetch
global.fetch = vi.fn();

// Mock props
const mockOnAddToFavourites = vi.fn();
const mockOnRemoveFromFavourites = vi.fn();
const mockOnAddToWatchlist = vi.fn();

// Mock movie data
const mockMovie = {
  imdbID: 'tt1234567',
  Title: 'Test Movie',
  Year: '2023',
  Director: 'Test Director',
  Actors: 'Actor 1, Actor 2',
  Plot: 'Test plot',
  Poster: 'test-poster.jpg',
  Runtime: '120 min',
  Genre: 'Action',
  Rated: 'PG-13',
  imdbRating: '8.5'
};

const mockWatchlists = {
  watchlists: [
    {
      _id: '1',
      name: 'Test Watchlist',
      movies: []
    }
  ]
};

const mockFavorites = {
  favorites: []
};

// Setup function to create all necessary mocked responses
const setupFetchMocks = (isError = false) => {
  if (isError) {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));
    return;
  }

  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockMovie
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trailerUrl: null })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockWatchlists
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockFavorites
    });
};

// Setup render function with user context
const renderMovieDetail = (isLoggedIn = false) => {
  vi.spyOn(UserContext, 'useUser').mockImplementation(() => ({
    isLoggedIn,
    user: isLoggedIn ? { id: 'testUser' } : null
  }));

  return render(
    <BrowserRouter>
      <MovieDetail
        onAddToFavourites={mockOnAddToFavourites}
        onRemoveFromFavourites={mockOnRemoveFromFavourites}
        onAddToWatchlist={mockOnAddToWatchlist}
      />
    </BrowserRouter>
  );
};

describe('MovieDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockReset();
  });

  describe('Loading States', () => {
    it('shows loading state initially', () => {
      setupFetchMocks();
      renderMovieDetail();
      expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();
      expect(screen.getByText(/Rolling out the details, just for you/i)).toBeInTheDocument();
    });

    it('handles error state', async () => {
      setupFetchMocks(true);
      renderMovieDetail();

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
      });
    });
  });

  describe('Movie Details Display', () => {
    beforeEach(() => {
      setupFetchMocks();
    });

    it('displays basic movie information', async () => {
      renderMovieDetail();

      await waitFor(() => {
        expect(screen.getByText(mockMovie.Title)).toBeInTheDocument();
        expect(screen.getByText(mockMovie.Director)).toBeInTheDocument();
        expect(screen.getByText(mockMovie.Plot)).toBeInTheDocument();
        expect(screen.getByText(`${mockMovie.imdbRating}/10`)).toBeInTheDocument();
      });
    });

    it('displays movie metadata correctly', async () => {
      renderMovieDetail();

      await waitFor(() => {
        expect(screen.getByText(mockMovie.Year)).toBeInTheDocument();
        expect(screen.getByText(mockMovie.Genre)).toBeInTheDocument();
        expect(screen.getByText(mockMovie.Runtime)).toBeInTheDocument();
        expect(screen.getByText(mockMovie.Rated)).toBeInTheDocument();
      });
    });

    it('displays movie poster', async () => {
      renderMovieDetail();

      await waitFor(() => {
        const poster = screen.getByAltText(mockMovie.Title);
        expect(poster).toBeInTheDocument();
        expect(poster).toHaveAttribute('src', mockMovie.Poster);
      });
    });
  });

  describe('Authentication States', () => {
    beforeEach(() => {
      setupFetchMocks();
    });

    it('shows sign in message when not logged in', async () => {
      renderMovieDetail(false);

      await waitFor(() => {
        const message = screen.getByText(/please/i, { exact: false });
        expect(message).toBeInTheDocument();
        const signInLink = screen.getByRole('link', { name: /sign in/i });
        expect(signInLink).toHaveAttribute('href', '/signin');
      });
    });

    it('shows action buttons when logged in', async () => {
      renderMovieDetail(true);

      await waitFor(() => {
        expect(screen.getByText(/Add to Favourites/i)).toBeInTheDocument();
        expect(screen.getByText(/Add to Watchlist/i)).toBeInTheDocument();
      });
    });
  });

  describe('Watchlist Functionality', () => {
    beforeEach(() => {
      setupFetchMocks();
    });

    it('opens watchlist modal', async () => {
      renderMovieDetail(true);

      await waitFor(() => {
        const watchlistButton = screen.getByText(/Add to Watchlist/i);
        fireEvent.click(watchlistButton);
      });

      expect(screen.getByText('Test Watchlist')).toBeInTheDocument();
      expect(screen.getByText('New Watchlist')).toBeInTheDocument();
    });

    it('creates new watchlist', async () => {
      renderMovieDetail(true);

      await waitFor(() => {
        const watchlistButton = screen.getByText(/Add to Watchlist/i);
        fireEvent.click(watchlistButton);
      });

      fireEvent.click(screen.getByText('New Watchlist'));
      expect(screen.getByPlaceholderText('Enter watchlist name')).toBeInTheDocument();
    });
  });

  describe('Favourites Functionality', () => {
    beforeEach(() => {
      setupFetchMocks();
    });

    it('toggles favorite status', async () => {
      renderMovieDetail(true);

      await waitFor(() => {
        const favoriteLabel = screen.getByText(/Add to Favourites/i);
        fireEvent.click(favoriteLabel);
      });

      expect(mockOnAddToFavourites).toHaveBeenCalledWith(mockMovie.imdbID);
    });
  });

  describe('Trailer Display', () => {
    it('shows trailer when available', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMovie
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ trailerUrl: 'https://youtube.com/embed/test' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWatchlists
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockFavorites
        });

      renderMovieDetail(true);

      await waitFor(() => {
        expect(screen.getByText('Watch Trailer:')).toBeInTheDocument();
        expect(screen.getByTitle('Movie Trailer')).toBeInTheDocument();
      });
    });

    it('shows no trailer message when trailer is not available', async () => {
      setupFetchMocks();
      renderMovieDetail(true);

      await waitFor(() => {
        expect(screen.getByText('Trailer not available.')).toBeInTheDocument();
      });
    });
  });
});