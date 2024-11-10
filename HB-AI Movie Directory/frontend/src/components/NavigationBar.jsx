import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const NavigationBar = ({ user, isLoggedIn, handleLogout, darkMode, setDarkMode, logo, userLogo }) => {
  // State for mobile menu
  const [isOpen, setIsOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Close mobile menu on screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.mobile-menu') && !e.target.closest('.menu-button')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  // Logo component with home navigation
  const LogoComponent = () => (
    <a
      href="/"
      className="flex items-center cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        window.location.href = "/";
      }}
    >
      <img src={logo} alt="Logo" className="w-7 h-7" />
      <p className="text-center text-lg px-2">HB-AI Movie Directory</p>
    </a>
  );

  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      const menuElement = document.querySelector('.mobile-menu');
      if (menuElement) {
        // Always move with scroll, both up and down
        menuElement.style.marginTop = `-${position}px`;
      }
      setScrollPosition(position);
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollPosition]);

  return (
    <nav className="flex items-center h-[4.28rem] px-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center flex-1">
        {/* Mobile Menu Hamburger Button */}
        <button
          className="md:hidden menu-button p-2 text-gray-600 dark:text-gray-300 hover:text-orange-400 dark:hover:text-orange-400 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 490.667 490.667"
            className="w-6 h-6"
            fill="currentColor"
          >
            <g>
              <path d="M469.333,224h-448C9.551,224,0,233.551,0,245.333c0,11.782,9.551,21.333,21.333,21.333h448
                c11.782,0,21.333-9.551,21.333-21.333C490.667,233.551,481.115,224,469.333,224z"/>
              <path d="M21.333,117.333h448c11.782,0,21.333-9.551,21.333-21.333s-9.551-21.333-21.333-21.333h-448
                C9.551,74.667,0,84.218,0,96S9.551,117.333,21.333,117.333z"/>
              <path d="M469.333,373.333h-448C9.551,373.333,0,382.885,0,394.667C0,406.449,9.551,416,21.333,416h448
                c11.782,0,21.333-9.551,21.333-21.333C490.667,382.885,481.115,373.333,469.333,373.333z"/>
            </g>
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center ml-2 md:ml-0">
          <LogoComponent />
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu md:hidden ${isOpen ? 'open' : 'closed'}`}>
        <div className="flex flex-col p-4 space-y-4">
          {!isLoggedIn ? (
            <>
              <Link to="/signin" className="nav-button" onClick={() => setIsOpen(false)}>
                SIGN IN
              </Link>
              <Link to="/signup" className="nav-button" onClick={() => setIsOpen(false)}>
                SIGN UP
              </Link>
            </>
          ) : (
            <>
              <Link to="/favourites" className="nav-button" onClick={() => setIsOpen(false)}>
                FAVOURITES
              </Link>
              <Link to="/watchlist" className="nav-button" onClick={() => setIsOpen(false)}>
                WATCHLIST
              </Link>
              <Link to="/profile" className="nav-button" onClick={() => setIsOpen(false)}>
                PROFILE
              </Link>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="nav-button text-left">
                LOGOUT
              </button>
            </>
          )}
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="flex items-center space-x-2 nav-button"
          >
            {darkMode ? 'LIGHT MODE' : 'DARK MODE'}
          </button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center">
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
          <>
            <Link to="/favourites" className="nav-button mr-4">
              FAVOURITES
            </Link>
            <Link to="/watchlist" className="nav-button mr-4">
              WATCHLIST
            </Link>
            <button onClick={handleLogout} className="nav-button mr-4">
              LOGOUT
            </button>
            <Link to="/profile" className="mr-4">
              <img
                src={user?.profilePicture || userLogo}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border border-gray-300 hover:border-orange-400 transition-colors duration-300"
              />
            </Link>
          </>
        )}

        {/* Dark mode toggle */}
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#ffffff"
              className="w-6 h-6 hover:fill-orange-300"
            >
              <path d="M12,17c-2.76,0-5-2.24-5-5s2.24-5,5-5,5,2.24,5,5-2.24,5-5,5Zm0-8c-1.65,0-3,1.35-3,3s1.35,3,3,3,3-1.35,3-3-1.35-3-3-3Zm1-5V1c0-.55-.45-1-1-1s-1,.45-1,1v3c0,.55,.45,1,1,1s1-.45,1-1Zm0,19v-3c0-.55-.45-1-1-1s-1,.45-1,1v3c0,.55,.45,1,1,1s1-.45,1-1ZM5,12c0-.55-.45-1-1-1H1c-.55,0-1,.45-1,1s.45,1,1,1h3c.55,0,1-.45,1-1Zm19,0c0-.55-.45-1-1-1h-3c-.55,0-1,.45-1,1s.45,1,1,1h3c.55,0,1-.45,1-1ZM6.71,6.71c.39-.39,.39-1.02,0-1.41l-2-2c-.39-.39-1.02-.39-1.41,0s-.39,1.02,0,1.41l2,2c.2,.2,.45,.29,.71,.29s.51-.1,.71-.29Zm14,14c.39-.39,.39-1.02,0-1.41l-2-2c-.39-.39-1.02-.39-1.41,0s-.39,1.02,0,1.41l2,2c.2,.2,.45,.29,.71,.29s.51-.1,.71-.29Zm-16,0l2-2c.39-.39,.39-1.02,0-1.41s-1.02-.39-1.41,0l-2,2c-.39,.39-.39,1.02,0,1.41,.2,.2,.45,.29,.71,.29s.51-.1,.71-.29ZM18.71,6.71l2-2c.39-.39,.39-1.02,0-1.41s-1.02-.39-1.41,0l-2,2c-.39,.39-.39,1.02,0,1.41,.2,.2,.45,.29,.71,.29s.51-.1,.71-.29Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#1E293B"
              className="w-6 h-6 hover:fill-blue-700"
            >
              <g>
                <path d="M13.273,5.865l.831,.303c.328,.12,.586,.373,.707,.693l.307,.82c.146,.391,.519,.65,.936,.65h0c.417,0,.79-.258,.937-.649l.307-.818c.122-.322,.38-.576,.708-.695l.831-.303c.395-.144,.657-.52,.657-.939s-.263-.795-.657-.939l-.831-.303c-.328-.12-.586-.373-.707-.694l-.308-.82c-.146-.391-.52-.649-.937-.649h0c-.417,0-.79,.259-.936,.65l-.306,.817c-.122,.322-.38,.576-.708,.695l-.831,.303c-.395,.144-.657,.52-.657,.939s.263,.795,.657,.939Z" />
                <path d="M22.386,12.003c-.402-.168-.87-.056-1.151,.279-.928,1.106-2.507,1.621-4.968,1.621-3.814,0-6.179-1.03-6.179-6.158,0-2.397,.532-4.019,1.626-4.957,.33-.284,.439-.749,.269-1.15-.17-.4-.571-.646-1.015-.604C5.285,1.572,1,6.277,1,11.977c0,6.062,4.944,10.994,11.022,10.994,5.72,0,10.438-4.278,10.973-9.951,.042-.436-.205-.848-.609-1.017Zm-10.363,8.967c-4.975,0-9.022-4.035-9.022-8.994,0-3.827,2.362-7.105,5.78-8.402-.464,1.134-.692,2.517-.692,4.17,0,7.312,4.668,8.158,8.179,8.158,1.216,0,2.761-.094,4.177-.673-1.306,3.396-4.588,5.74-8.421,5.74Z" />
              </g>
              <g>
                <circle cx="18.49" cy="11.349" r="1" />
                <circle cx="13.99" cy="10.766" r="1" />
              </g>
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
};

// propTypes validation
NavigationBar.propTypes = {
  user: PropTypes.object,
  isLoggedIn: PropTypes.bool.isRequired,
  handleLogout: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  setDarkMode: PropTypes.func.isRequired,
  logo: PropTypes.string.isRequired,
  userLogo: PropTypes.string.isRequired
};

export default NavigationBar;