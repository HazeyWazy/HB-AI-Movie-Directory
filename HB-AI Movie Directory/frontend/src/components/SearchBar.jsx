import React, { useState } from "react";
import PropTypes from 'prop-types';
import "../index.css";

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className='text-center'>
        <input
          className='px-4 py-3 outline-none w-11/12 md:w-9/12 lg:w-6/12 xl:w-5/12 mt-3 rounded-full transition-colors duration-100 border-solid border-2 bg-slate-100 text-gray-800 border-gray-300 focus:border-orange-300 dark:text-white dark:bg-gray-800 dark:focus:border-blue-900 dark:border-slate-700'
          type='text'
          name='text'
          placeholder='What are we watching today?'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>
    </div>
  );
};

// propTypes validation
SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
