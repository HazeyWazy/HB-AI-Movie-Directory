// Global user authentication and management context
import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiUrl } from '../config';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // User state management
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fetch user information from token
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }
      // Fetch and validate user session
      const response = await fetch(`${apiUrl}/auth/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      // Handle response
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsLoggedIn(true);
      } else {
        throw new Error("Failed to fetch user info");
      }
    } catch (error) {
      // Clear invalid session
      console.error("Error fetching user info:", error);
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem("token");
    }
  };

  // Authentication handlers
  const login = async () => {
    await fetchUserInfo();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
  };

  // Update user profile data
  const updateUser = (newUserData) => {
    setUser(prevUser => ({ ...prevUser, ...newUserData }));
  };

  // Initial auth check
  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoggedIn, 
      login, 
      logout, 
      fetchUserInfo, 
      updateUser 
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for accessing user context
export const useUser = () => useContext(UserContext);