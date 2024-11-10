// Search component with loading state and URL parameter synchronization
import React, { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import "../index.css";

// Loading spinning wheel
const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 z-50">
    <div className="flex flex-col min-h-[85vh] text-center justify-center">
      <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-orange-300 border-t-gray-300"></div>
      <p className="mt-4 text-lg text-slate-900 dark:text-white">
        Rolling out your movie recommendations
      </p>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Finding the perfect movies for you
      </p>
    </div>
  </div>
);

const SearchBar = ({ onSearch, isLoading = false }) => {
  // URL parameters for search term persistence
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize search term from URL params
  useEffect(() => {
    const queryParam = searchParams.get("q");
    if (queryParam && !hasInitialized) {
      setSearchTerm(queryParam);
      // Only trigger search if we're on the home page
      if (location.pathname === "/") {
        onSearch(queryParam);
        setHasInitialized(true);
      }
    }
  }, [searchParams, location.pathname, onSearch, hasInitialized]);

  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedTerm = searchTerm.trim();
    if (trimmedTerm && !isLoading) {
      // Update URL with search term
      setSearchParams({ q: trimmedTerm });
      onSearch(trimmedTerm);
    }
  };

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay />}
      <div className="relative">
        <form onSubmit={handleSubmit} className="text-center">
          <div className="relative inline-block w-11/12 md:w-9/12 lg:w-6/12 xl:w-5/12">
            <input
              className="px-4 py-3 outline-none w-full mt-3 rounded-full transition-colors duration-100 border-solid border-2 bg-slate-100 text-gray-800 border-gray-300 focus:border-orange-300 dark:text-white dark:bg-gray-800 dark:focus:border-blue-900 dark:border-slate-700"
              type="text"
              name="text"
              placeholder="What are we watching today?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
              autoComplete="on"
            />
          </div>
        </form>
      </div>
    </>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default SearchBar;