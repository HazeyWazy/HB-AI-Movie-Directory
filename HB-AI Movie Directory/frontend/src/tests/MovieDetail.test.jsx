import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from 'react';
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import MovieDetail from "../components/MovieDetail";
import * as UserContext from '../context/UserContext';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'tt1234567' })
  };
});

global.fetch = vi.fn();

const mockOnAddToFavourites = vi.fn();
const mockOnRemoveFromFavourites = vi.fn();
const mockOnAddToWatchlist = vi.fn();

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

const mockMovieResponse = {
  ok: true,
  json: () => Promise.resolve(mockMovie)
};

const mockFavoritesResponse = {
  ok: true,
  json: () => Promise.resolve({ favorites: [] })
};

const mockWatchlistsResponse = {
  ok: true,
  json: () => Promise.resolve({ watchlists: [] })
};

const mockTrailerResponse = {
  ok: false,
  json: () => Promise.resolve({ trailerUrl: null })
};

const renderMovieDetail = async (isLoggedIn = false) => {
  vi.spyOn(UserContext, 'useUser').mockImplementation(() => ({
    isLoggedIn
  }));

  let rendered;
  await act(async () => {
    rendered = render(
      <BrowserRouter>
        <MovieDetail
          onAddToFavourites={mockOnAddToFavourites}
          onRemoveFromFavourites={mockOnRemoveFromFavourites}
          onAddToWatchlist={mockOnAddToWatchlist}
        />
      </BrowserRouter>
    );
  });
  return rendered;
};

describe('MovieDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockReset();
  });

  it('renders loading state initially', async () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    
    await renderMovieDetail();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders movie details correctly', async () => {
    const responses = [
      mockMovieResponse,
      mockTrailerResponse,
      mockFavoritesResponse,
      mockWatchlistsResponse
    ];
    
    responses.forEach(response => {
      fetch.mockImplementationOnce(() => Promise.resolve(response));
    });

    await renderMovieDetail(true);

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
      expect(screen.getByText('Test Director')).toBeInTheDocument();
      expect(screen.getByText('Test plot')).toBeInTheDocument();
    });
  });

  it('handles favorite toggling when logged in', async () => {
    const responses = [
      mockMovieResponse,
      mockTrailerResponse,
      mockFavoritesResponse,
      mockWatchlistsResponse
    ];
    
    responses.forEach(response => {
      fetch.mockImplementationOnce(() => Promise.resolve(response));
    });

    await renderMovieDetail(true);

    await waitFor(() => {
      const favoriteCheckbox = screen.getByRole('checkbox', { hidden: true });
      expect(favoriteCheckbox).toBeInTheDocument();
    });

    const favoriteCheckbox = screen.getByRole('checkbox', { hidden: true });
    await act(async () => {
      fireEvent.click(favoriteCheckbox);
    });

    expect(mockOnAddToFavourites).toHaveBeenCalledWith(mockMovie.imdbID);
  });

  it('shows sign in message when not logged in', async () => {
    const responses = [
      mockMovieResponse,
      mockTrailerResponse
    ];
    
    responses.forEach(response => {
      fetch.mockImplementationOnce(() => Promise.resolve(response));
    });
  
    await renderMovieDetail(false);
  
    await waitFor(() => {
      // Find the paragraph element specifically
      expect(screen.getByText(
        (content, element) => {
          return (
            element.tagName.toLowerCase() === 'p' && 
            element.textContent.includes('Please') && 
            element.textContent.includes('sign in') &&
            element.textContent.includes('to add the movie to favourites and watchlists')
          );
        }
      )).toBeInTheDocument();
      
      // Test the sign in link separately
      expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/signin');
    });
  });

  it('shows watchlist modal', async () => {
    const responses = [
      mockMovieResponse,
      mockTrailerResponse,
      mockFavoritesResponse,
      mockWatchlistsResponse
    ];
    
    responses.forEach(response => {
      fetch.mockImplementationOnce(() => Promise.resolve(response));
    });

    await renderMovieDetail(true);

    await waitFor(() => {
      const watchlistButton = screen.getByRole('button', { name: /add to watchlist/i });
      expect(watchlistButton).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add to watchlist/i }));
    });

    expect(screen.getByText(/you have no watchlist yet/i)).toBeInTheDocument();
  });
});