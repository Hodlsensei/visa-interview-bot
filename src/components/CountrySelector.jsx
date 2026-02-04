import React, { useState } from 'react';

const COUNTRIES = [
  { name: 'United States', flag: '🇺🇸', code: 'USA', difficulty: 'Hard', color: 'from-blue-600 to-red-600' },
  { name: 'United Kingdom', flag: '🇬🇧', code: 'GBR', difficulty: 'Medium', color: 'from-blue-700 to-red-700' },
  { name: 'Canada', flag: '🇨🇦', code: 'CAN', difficulty: 'Medium', color: 'from-red-600 to-white' },
  { name: 'Australia', flag: '🇦🇺', code: 'AUS', difficulty: 'Medium', color: 'from-blue-600 to-green-600' },
  { name: 'Germany', flag: '🇩🇪', code: 'DEU', difficulty: 'Easy-Medium', color: 'from-black to-red-600' },
  { name: 'France', flag: '🇫🇷', code: 'FRA', difficulty: 'Easy-Medium', color: 'from-blue-600 to-red-600' },
  { name: 'Japan', flag: '🇯🇵', code: 'JPN', difficulty: 'Easy', color: 'from-white to-red-600' },
  { name: 'Singapore', flag: '🇸🇬', code: 'SGP', difficulty: 'Easy', color: 'from-red-600 to-white' },
];

export default function CountrySelector({ onSelect }) {
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleSelect = (country) => {
    setSelectedCountry(country);
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'Easy') return 'text-green-400';
    if (difficulty.includes('Medium')) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Select Your Destination</h2>
        <p className="text-slate-400 text-lg">Choose which country's visa you want to practice for</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {COUNTRIES.map((country) => (
          <button
            key={country.code}
            onClick={() => handleSelect(country)}
            className={`p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
              selectedCountry?.code === country.code
                ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/50'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
            }`}
          >
            <div className="text-6xl mb-3">{country.flag}</div>
            <h3 className="text-xl font-bold mb-2">{country.name}</h3>
            <p className={`text-sm font-semibold ${getDifficultyColor(country.difficulty)}`}>
              Difficulty: {country.difficulty}
            </p>
          </button>
        ))}
      </div>

      {selectedCountry && (
        <div className="text-center animate-fadeIn">
          <button
            onClick={() => onSelect(selectedCountry)}
            className="px-12 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Start {selectedCountry.name} Visa Interview
          </button>
        </div>
      )}
    </div>
  );
}