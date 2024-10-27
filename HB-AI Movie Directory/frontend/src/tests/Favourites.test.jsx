import { render, screen, waitFor } from "@testing-library/react";
import { act } from 'react';
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Favourites from "../components/Favourites";

global.fetch = vi.fn();

const mockMovies = [
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
];

const mockLocalStorage = {
  getItem: vi.fn(() => 'mock-token'),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('Favourites Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockReset();
  });

  const renderFavourites = async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Favourites />
        </BrowserRouter>
      );
    });
  };

  it('shows loading state initially', async () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    
    await renderFavourites();
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Bringing your favourites together')).toBeInTheDocument();
  });

  it('renders favourites list correctly', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ favorites: mockMovies })
      })
    );

    await renderFavourites();

    await waitFor(() => {
      expect(screen.getByText('Your Favourite Movies')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 1 (2023)')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2 (2022)')).toBeInTheDocument();
      expect(screen.getByText('Rating: 8.5/10')).toBeInTheDocument();
    });
  });

  it('handles empty favourites list', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ favorites: [] })
      })
    );

    await renderFavourites();

    await waitFor(() => {
      expect(screen.getByText('You have no favourite movies yet.')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch favourites' })
      })
    );

    await renderFavourites();

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('creates correct movie links', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ favorites: mockMovies })
      })
    );

    await renderFavourites();

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/movie/tt1234567');
      expect(links[1]).toHaveAttribute('href', '/movie/tt7654321');
    });
  });
});