import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import MovieList from "./components/MovieList";
import MovieDetail from "./components/MovieDetail";
import "./App.css";

function App() {
  const [movies, setMovies] = useState([]);
  const location = useLocation();

  const handleSearch = async (searchTerm) => {
    try {
      const response = await fetch(
        `https://group-project-gwdp-monday-12pm.onrender.com/api/search?title=${searchTerm}`
      );
      const data = await response.json();
      setMovies(data.Search || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  return (
    <div className="app">
      <nav className="nav-bar">
        <Link to="/" className="home-link">
          HOME
        </Link>
      </nav>
      {location.pathname === "/" && (
        <h1 className="app-title">HB-AI Movie Directory</h1>
      )}
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
