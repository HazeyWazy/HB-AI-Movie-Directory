import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import MovieList from "./components/MovieList";
import MovieDetail from "./components/MovieDetail";

function App() {
  const [movies, setMovies] = useState([]);

  const handleSearch = async (searchTerm) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/search?title=${searchTerm}`
      );
      const data = await response.json();
      setMovies(data.Search || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <SearchBar onSearch={handleSearch} />
              <MovieList movies={movies} />
            </>
          }
        />
        <Route path="/movie/:id" element={<MovieDetail />} />
      </Routes>
    </div>
  );
}

export default App;
