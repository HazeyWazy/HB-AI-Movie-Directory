import { render, screen } from "@testing-library/react";
import { act } from 'react';
import { describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import MovieList from "../components/MovieList";

const mockMovies = [
  {
    imdbID: "tt1234567",
    Title: "Test Movie 1",
    Year: "2023",
    Poster: "test-poster-1.jpg",
    Type: "movie"
  },
  {
    imdbID: "tt7654321",
    Title: "Test Movie 2",
    Year: "2022",
    Poster: "test-poster-2.jpg",
    Type: "movie"
  }
];

const renderMovieList = async (movies = mockMovies) => {
  await act(async () => {
    render(
      <BrowserRouter>
        <MovieList movies={movies} />
      </BrowserRouter>
    );
  });
};

describe('MovieList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders movie cards correctly', async () => {
    await renderMovieList();
    
    expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('handles movies with missing posters', async () => {
    const moviesWithMissingPoster = [
      {
        ...mockMovies[0],
        Poster: "N/A"
      }
    ];

    await renderMovieList(moviesWithMissingPoster);
    
    const img = screen.getByAltText('Test Movie 1');
    expect(img.src).toContain('placeholder');
  });

  it('creates correct movie detail links', async () => {
    await renderMovieList();
    
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/movie/tt1234567');
    expect(links[1]).toHaveAttribute('href', '/movie/tt7654321');
  });

  it('renders movie type and year', async () => {
    await renderMovieList();
    
    expect(screen.getByText('2023 • movie')).toBeInTheDocument();
    expect(screen.getByText('2022 • movie')).toBeInTheDocument();
  });

  it('filters out null movies', async () => {
    const moviesWithNull = [...mockMovies, null];
    await renderMovieList(moviesWithNull);
    
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});