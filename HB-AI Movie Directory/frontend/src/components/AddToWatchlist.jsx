import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AddToWatchlist = ({ movieId }) => {
  const [watchlists, setWatchlists] = useState([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [isCreatingWatchlist, setIsCreatingWatchlist] = useState(false);

  useEffect(() => {
    checkAuthentication();
    if (isAuthenticated) {
      fetchWatchlists();
    }
  }, [isAuthenticated]);

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  };

  const fetchWatchlists = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/watchlists', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setWatchlists(data);
      }
    } catch (error) {
      console.error('Error fetching watchlists:', error);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!selectedWatchlist) {
      setMessage('Please select a watchlist');
      return;
    }
    setIsAdding(true);
    try {
      const response = await fetch('http://localhost:5000/api/watchlists/addMovie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ watchlistId: selectedWatchlist, movieId }),
      });
      if (response.ok) {
        setMessage('Movie added to watchlist successfully');
      } else {
        setMessage('Failed to add movie to watchlist');
      }
    } catch (error) {
      console.error('Error adding movie to watchlist:', error);
      setMessage('Error adding movie to watchlist');
    }
    setIsAdding(false);
  };

  const handleCreateWatchlist = async (e) => {
    e.preventDefault();
    setIsCreatingWatchlist(true);
    try {
      const response = await fetch('http://localhost:5000/api/watchlists/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newWatchlistName }),
      });
      if (response.ok) {
        const data = await response.json();
        setWatchlists([...watchlists, data.watchlist]);
        setNewWatchlistName('');
        setMessage('New watchlist created successfully');
      } else {
        setMessage('Failed to create new watchlist');
      }
    } catch (error) {
      console.error('Error creating watchlist:', error);
      setMessage('Error creating watchlist');
    }
    setIsCreatingWatchlist(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="mt-4">
        <p>Please <Link to="/signin" className="text-blue-500 hover:underline">sign in</Link> to add movies to your watchlist.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {watchlists.length === 0 ? (
        <div>
          <p>You don't have any watchlists yet. Create one now:</p>
          <form onSubmit={handleCreateWatchlist} className="mt-2">
            <input
              type="text"
              value={newWatchlistName}
              onChange={(e) => setNewWatchlistName(e.target.value)}
              placeholder="New watchlist name"
              className="mr-2 p-2 rounded dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              disabled={isCreatingWatchlist}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
            >
              {isCreatingWatchlist ? 'Creating...' : 'Create Watchlist'}
            </button>
          </form>
        </div>
      ) : (
        <>
          <select
            value={selectedWatchlist}
            onChange={(e) => setSelectedWatchlist(e.target.value)}
            className="mr-2 p-2 rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select a watchlist</option>
            {watchlists.map((watchlist) => (
              <option key={watchlist._id} value={watchlist._id}>{watchlist.name}</option>
            ))}
          </select>
          <button
            onClick={handleAddToWatchlist}
            disabled={isAdding}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            {isAdding ? 'Adding...' : 'Add to Watchlist'}
          </button>
        </>
      )}
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
};

export default AddToWatchlist;