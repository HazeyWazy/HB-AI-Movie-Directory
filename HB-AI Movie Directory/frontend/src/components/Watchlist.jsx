import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../config";

function Watchlist() {
  const [watchlists, setWatchlists] = useState([]);
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWatchlists();
  }, []);

  const fetchWatchlists = async () => {
    try {
      const response = await fetch(`${apiUrl}/watchlists`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWatchlists(data.watchlists || []);
      } else {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to fetch watchlists");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching watchlists:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWatchlist = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/watchlist`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newWatchlistName }),
      });

      if (response.ok) {
        setNewWatchlistName("");
        fetchWatchlists();
      } else {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to create watchlist");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error creating watchlist:", err);
    }
  };

  const handleDeleteWatchlist = async (watchlistId) => {
    try {
      const response = await fetch(`${apiUrl}/watchlist/${watchlistId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setWatchlists((prevWatchlists) =>
          prevWatchlists.filter((w) => w._id !== watchlistId)
        );
      } else {
        throw new Error("Failed to delete watchlist");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error deleting watchlist:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-[85vh] text-center justify-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-orange-300 border-t-gray-300"></div>
        <p className="mt-4 text-lg text-slate-900 dark:text-white">
          Loading...
        </p>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Fetching your watchlists
        </p>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex-col flex-wrap justify-center gap-10 px-4 py-6">
      <h2 className="text-center text-4xl font-medium">Your Watchlists</h2>

      <form onSubmit={handleCreateWatchlist} className="mt-6 mb-10">
        <input
          type="text"
          value={newWatchlistName}
          onChange={(e) => setNewWatchlistName(e.target.value)}
          placeholder="New watchlist name"
          className="px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Watchlist
        </button>
      </form>

      {watchlists.length === 0 ? (
        <p className="mt-10 text-xl text-center">You have no watchlists yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {watchlists.map((watchlist) => (
            <div
              key={watchlist._id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-slate-950 hover:shadow-xl transition-shadow duration-300 p-6"
            >
              <Link to={`/watchlist/${watchlist._id}`} className="block mb-2">
                <h3 className="text-xl font-semibold">{watchlist.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {watchlist.movies.length} movies
                </p>
              </Link>
              <button
                onClick={() => handleDeleteWatchlist(watchlist._id)}
                className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete Watchlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Watchlist;
