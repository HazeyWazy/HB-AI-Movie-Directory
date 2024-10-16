import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import SearchBar from "./components/SearchBar";
import MovieList from "./components/MovieList";
import MovieDetail from "./components/MovieDetail";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import logo from "./imgs/film-roll.png";
import "./index.css";

function App() {
  const [movies, setMovies] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("Guest");
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize dark mode and check login status
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Update dark mode
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleSearch = async (searchTerm) => {
    try {
      const response = await fetch(
        `https://group-project-gwdp-monday-12pm.onrender.com/api/movies/suggestMoviesAI?userPrompt=${searchTerm}`
      );
      const data = await response.json();
      console.log(data);
      setMovies(data.results || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("https://group-project-gwdp-monday-12pm.onrender.com/api/auth/user", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUsername(data.name);
      } else {
        throw new Error("Failed to fetch user info");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      setUsername("Guest");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("https://group-project-gwdp-monday-12pm.onrender.com/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setUsername("Guest");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-white transition-all duration-300">
      
      {/* Navigation bar */}
      <nav className="flex justify-between items-center py-5 px-4 border-b border-gray-200 dark:border-gray-800">

      {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center cursor-pointer">
            <img src={logo} alt="Logo" className="w-7 h-7" />
            <p className="text-center text-lg px-2">HB-AI Movie Directory</p>
          </Link>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center">
          <Link to="/" className="nav-button mr-4">
            HOME
          </Link>

          {!isLoggedIn ? (
            <>
              <Link to="/signin" className="nav-button mr-4">
                SIGN IN
              </Link>
              <Link to="/signup" className="nav-button mr-4">
                SIGN UP
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} className="nav-button mr-4">
              LOGOUT
            </button>
          )}

          {/* light/dark mode toggle */}
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? (
              // sun icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#ffffff"
                className="w-6 h-6 hover:fill-orange-300"
              >
                <path d='M12,17c-2.76,0-5-2.24-5-5s2.24-5,5-5,5,2.24,5,5-2.24,5-5,5Zm0-8c-1.65,0-3,1.35-3,3s1.35,3,3,3,3-1.35,3-3-1.35-3-3-3Zm1-5V1c0-.55-.45-1-1-1s-1,.45-1,1v3c0,.55,.45,1,1,1s1-.45,1-1Zm0,19v-3c0-.55-.45-1-1-1s-1,.45-1,1v3c0,.55,.45,1,1,1s1-.45,1-1ZM5,12c0-.55-.45-1-1-1H1c-.55,0-1,.45-1,1s.45,1,1,1h3c.55,0,1-.45,1-1Zm19,0c0-.55-.45-1-1-1h-3c-.55,0-1,.45-1,1s.45,1,1,1h3c.55,0,1-.45,1-1ZM6.71,6.71c.39-.39,.39-1.02,0-1.41l-2-2c-.39-.39-1.02-.39-1.41,0s-.39,1.02,0,1.41l2,2c.2,.2,.45,.29,.71,.29s.51-.1,.71-.29Zm14,14c.39-.39,.39-1.02,0-1.41l-2-2c-.39-.39-1.02-.39-1.41,0s-.39,1.02,0,1.41l2,2c.2,.2,.45,.29,.71,.29s.51-.1,.71-.29Zm-16,0l2-2c.39-.39,.39-1.02,0-1.41s-1.02-.39-1.41,0l-2,2c-.39,.39-.39,1.02,0,1.41,.2,.2,.45,.29,.71,.29s.51-.1,.71-.29ZM18.71,6.71l2-2c.39-.39,.39-1.02,0-1.41s-1.02-.39-1.41,0l-2,2c-.39,.39-.39,1.02,0,1.41,.2,.2,.45,.29,.71,.29s.51-.1,.71-.29Z' />              
              </svg>
            ) : (
              // moon stars icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#1E293B"
                className="w-6 h-6 hover:fill-blue-700"
              >
                <g>
                  <path d='M13.273,5.865l.831,.303c.328,.12,.586,.373,.707,.693l.307,.82c.146,.391,.519,.65,.936,.65h0c.417,0,.79-.258,.937-.649l.307-.818c.122-.322,.38-.576,.708-.695l.831-.303c.395-.144,.657-.52,.657-.939s-.263-.795-.657-.939l-.831-.303c-.328-.12-.586-.373-.707-.694l-.308-.82c-.146-.391-.52-.649-.937-.649h0c-.417,0-.79,.259-.936,.65l-.306,.817c-.122,.322-.38,.576-.708,.695l-.831,.303c-.395,.144-.657,.52-.657,.939s.263,.795,.657,.939Z' />
                  <path d='M22.386,12.003c-.402-.168-.87-.056-1.151,.279-.928,1.106-2.507,1.621-4.968,1.621-3.814,0-6.179-1.03-6.179-6.158,0-2.397,.532-4.019,1.626-4.957,.33-.284,.439-.749,.269-1.15-.17-.4-.571-.646-1.015-.604C5.285,1.572,1,6.277,1,11.977c0,6.062,4.944,10.994,11.022,10.994,5.72,0,10.438-4.278,10.973-9.951,.042-.436-.205-.848-.609-1.017Zm-10.363,8.967c-4.975,0-9.022-4.035-9.022-8.994,0-3.827,2.362-7.105,5.78-8.402-.464,1.134-.692,2.517-.692,4.17,0,7.312,4.668,8.158,8.179,8.158,1.216,0,2.761-.094,4.177-.673-1.306,3.396-4.588,5.74-8.421,5.74Z' />
                </g>
                <g>
                  <circle cx='18.49' cy='11.349' r='1' />
                  <circle cx='13.99' cy='10.766' r='1' />
                </g>              
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="p-4 transition-all duration-300">
        {location.pathname === "/" && (
          <h1 className="text-center text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-medium mt-72 mb-5">
            Welcome, {username}!
          </h1>
        )}
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <SearchBar onSearch={handleSearch} />
                <MovieList movies={movies} />
              </div>
            }
          />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route
            path="/signin"
            element={
              <SignIn
                setIsLoggedIn={setIsLoggedIn}
                darkMode={darkMode}
                onLoginSuccess={fetchUserInfo}
              />
            }
          />
          <Route path="/signup" element={<SignUp darkMode={darkMode} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
