import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import movies from '../imgs/movies.jpeg';
import { apiUrl } from "../config";
import { useUser } from '../context/UserContext';

const SignIn = ({ darkMode }) => {
  // Form state management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  // Image animation timing
  useEffect(() => {
    const timer = setTimeout(() => setImageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        await login();  // Use the login function from UserContext
        navigate("/");
      } else {
        // Handle login error
        console.error("Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[85vh]">
      <div className="flex bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-950 overflow-hidden max-w-4xl w-full">
        <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-14 xl:px-18 h-[570.4px] w-full lg:w-1/2">
          <h2 className="text-3xl font-medium tracking-tight text-gray-900 dark:text-white my-8">
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-solid px-3 py-2 shadow-sm text-gray-800 border-gray-300 focus:border-indigo-500 focus:outline-none dark:text-white dark:bg-slate-800 dark:focus:border-blue-800 dark:border-slate-600 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 mb-3 block w-full rounded-md border border-solid px-3 py-2 shadow-sm text-gray-800 border-gray-300 focus:border-indigo-500 focus:outline-none dark:text-white dark:bg-slate-800 dark:focus:border-blue-800 dark:border-slate-600 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full justify-center rounded-md border border-transparent bg-indigo-600 dark:bg-blue-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sign in
            </button>
          </form>

          <p className="mt-10 mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold leading-6 text-indigo-600 dark:text-blue-500 hover:text-indigo-500"
            >
              Register
            </Link>
          </p>
        </div>
        
        {/* Image container with animation */}
        <div className="hidden md:block w-11/12 lg:w-1/2 overflow-hidden relative ">
          <img
            className={`h-full w-full object-cover absolute top-0 left-0 transition-transform duration-1000 ease-in-out ${
              imageLoaded ? 'translate-x-0' : 'translate-x-full'
            }`}
            src={movies}
            alt="Netflix Screen"
          />
        </div>
      </div>
    </div>
  );
};

// propTypes validation
SignIn.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};
export default SignIn;