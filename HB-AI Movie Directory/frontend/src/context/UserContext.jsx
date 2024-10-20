import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiUrl } from '../config';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }
      const response = await fetch(`${apiUrl}/auth/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsLoggedIn(true);
      } else {
        throw new Error("Failed to fetch user info");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem("token");
    }
  };

  const login = async () => {
    await fetchUserInfo();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
  };

  const updateUser = (newUserData) => {
    setUser(prevUser => ({ ...prevUser, ...newUserData }));
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoggedIn, login, logout, fetchUserInfo, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);