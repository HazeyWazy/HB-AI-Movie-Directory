import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const WatchlistSidebar = ({ isOpen, setIsOpen }) => {
  const [watchlists, setWatchlists] = useState([]);
  const [newWatchlistName, setNewWatchlistName] = useState("");

  useEffect(() => {
    fetchWatchlists();
  }, []);

  const fetchWatchlists = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/watchlists", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setWatchlists(data);
      }
    } catch (error) {
      console.error("Error fetching watchlists:", error);
    }
  };

  const createWatchlist = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:5000/api/watchlists/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newWatchlistName }),
          credentials: "include",
        }
      );
      if (response.ok) {
        setNewWatchlistName("");
        fetchWatchlists();
      }
    } catch (error) {
      console.error("Error creating watchlist:", error);
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out`}
    >
      <div className="p-4">
        {/* Close Button */}
        <button
          className="text-white text-2xl absolute top-4 right-4 focus:outline-none"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">Watchlists</h2>
        <ul>
          {watchlists.map((watchlist) => (
            <li key={watchlist._id} className="mb-2">
              <Link
                to={`/watchlist/${watchlist._id}`}
                className="hover:text-gray-300"
                onClick={() => setIsOpen(false)}
              >
                {watchlist.name}
              </Link>
            </li>
          ))}
        </ul>
        <form onSubmit={createWatchlist} className="mt-4">
          <input
            type="text"
            value={newWatchlistName}
            onChange={(e) => setNewWatchlistName(e.target.value)}
            placeholder="New watchlist name"
            className="w-full p-2 text-black"
          />
          <button
            type="submit"
            className="mt-2 bg-blue-500 text-white p-2 rounded"
          >
            Create Watchlist
          </button>
        </form>
      </div>
    </div>
  );
};

export default WatchlistSidebar;
