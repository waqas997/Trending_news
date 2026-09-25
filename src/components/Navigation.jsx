import React, { useState, useEffect, useRef } from 'react';
import countryList from 'country-list';

function Navigation({ onSearch, selectedCountry, onCountryChange }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Get all countries and sort them alphabetically
  const countries = countryList.getData().sort((a, b) => a.name.localeCompare(b.name));

  const COUNTRIES = [
    { code: 'global', name: 'Global' },
    ...countries.map(c => ({ code: c.code.toLowerCase(), name: c.name }))
  ];

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <nav className="top-nav">
      <div className="nav-top-row">
        <div className="nav-left">
          <button className="menu-btn mobile-hidden"><i className="fa-solid fa-bars"></i></button>
          <div className="logo-container">
            <h1>TRENDING NEWS</h1>
            <p className="mobile-hidden">Updated automatically every day with AI-powered summaries</p>
          </div>
        </div>
        <button className="profile-btn desktop-hidden"><i className="fa-regular fa-user"></i></button>
      </div>

      <div className="nav-search-row">
        <div className="search-container">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            placeholder="Search trending news..."
            onChange={(e) => onSearch(e.target.value)}
          />
          <button className="search-btn mobile-hidden">Search</button>
        </div>
      </div>

      <div className="nav-country-row">
        <div className="custom-country-selector" ref={dropdownRef}>
          <button
            className="custom-select-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="selected-text">{COUNTRIES.find(c => c.code === selectedCountry)?.name || 'Select'}</span>
            <i className="fa-solid fa-chevron-down" style={{ marginLeft: '8px', fontSize: '0.8em' }}></i>
          </button>

          {isDropdownOpen && (
            <div className="custom-select-menu">
              <div className="country-search-box">
                <input 
                  type="text" 
                  placeholder="Search country..." 
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
              <ul className="country-list">
                {filteredCountries.map(country => (
                  <li
                    key={country.code}
                    onClick={() => {
                      onCountryChange(country.code);
                      setIsDropdownOpen(false);
                      setCountrySearch('');
                    }}
                    className={selectedCountry === country.code ? 'selected' : ''}
                  >
                    {country.name}
                  </li>
                ))}
                {filteredCountries.length === 0 && (
                  <li className="no-results">No countries found</li>
                )}
              </ul>
            </div>
          )}
        </div>
        <button className="profile-btn mobile-hidden"><i className="fa-regular fa-user"></i></button>
      </div>
    </nav>
  );
}

export default Navigation;
