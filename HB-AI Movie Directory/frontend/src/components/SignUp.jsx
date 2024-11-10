import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import PropTypes from 'prop-types';
import movies from '../imgs/movies.jpeg';
import {apiUrl} from "../config";

const SignUp = ({ darkMode }) => {
  // Form state management
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  // Image animation timing
  useEffect(() => {
    const timer = setTimeout(() => setImageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle registration submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        navigate("/signin");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[85vh]">
      <div className="flex bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-950 overflow-hidden max-w-4xl w-full">
        {/* Image container with animation */}
        <div className="hidden md:block w-11/12 lg:w-1/2 overflow-hidden">
          <img
            className={`h-full w-full object-cover transition-transform duration-1000 ease-in-out ${
              imageLoaded ? 'translate-x-0' : '-translate-x-full'
            }`}
            src={movies}
            alt="Movies"
          />
        </div>
        
        <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-14 xl:px-18 w-full lg:w-1/2">
          <h2 className="text-3xl font-medium tracking-tight text-gray-900 dark:text-white my-8">
            Create your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-solid px-3 py-2 shadow-sm text-gray-800 border-gray-300 focus:border-indigo-500 focus:outline-none dark:text-white dark:bg-slate-800 dark:focus:border-blue-800 dark:border-slate-600 sm:text-sm"
              />
            </div>

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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-solid px-3 py-2 shadow-sm text-gray-800 border-gray-300 focus:border-indigo-500 focus:outline-none dark:text-white dark:bg-slate-800 dark:focus:border-blue-800 dark:border-slate-600 sm:text-sm"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full justify-center rounded-md border border-transparent bg-indigo-600 dark:bg-blue-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sign up
            </button>
          </form>

          <p className="mt-10 mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-semibold leading-6 text-indigo-600 dark:text-blue-500 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// propTypes validation
SignUp.propTypes = {
  darkMode: PropTypes.bool.isRequired, 
};

export default SignUp;