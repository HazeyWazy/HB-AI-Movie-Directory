import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../config";

function Watchlist() {
  const [watchlists, setWatchlists] = useState([]);
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWatchlists();
  }, []);

  useEffect(() => {
    // Clear modal error when input changes
    if (modalError) setModalError("");
  }, [newWatchlistName]);

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
    
    // Check for duplicate name
    const trimmedName = newWatchlistName.trim();
    const isDuplicate = watchlists.some(
      (watchlist) => watchlist.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setModalError("A watchlist with this name already exists.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/watchlist`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      if (response.ok) {
        setNewWatchlistName("");
        setIsModalOpen(false);
        fetchWatchlists();
      } else {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to create watchlist");
      }
    } catch (err) {
      setModalError(err.message);
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

  const closeModal = () => {
    setIsModalOpen(false);
    setNewWatchlistName("");
    setModalError("");
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-[85vh] text-center justify-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-orange-300 border-t-gray-300"></div>
        <p className="mt-4 text-lg text-slate-900 dark:text-white">Loading...</p>
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
    <div className="flex-col flex-wrap justify-center gap-10 px-4 py-6 relative min-h-[85vh]">
      <h2 className="text-center text-4xl font-medium">Your Watchlists</h2>

      {watchlists.length === 0 ? (
        <p className="mt-10 text-xl text-center">You have no watchlists yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
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

      {/* New Watchlist Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <span>+</span>
      </button>

      {/* Custom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                New Watchlist
              </h3>              
            </div>
            <form onSubmit={handleCreateWatchlist}>
              <input
                type="text"
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                placeholder="Enter watchlist name"
                className={`w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  modalError ? 'border-red-500' : ''
                }`}
                autoFocus
              />
              {modalError && (
                <p className="text-red-500 text-sm mt-1">{modalError}</p>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newWatchlistName.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Watchlist;