import React from 'react';
import { SearchIcon } from './icons/SearchIcon';

// Fix: Update props to make this a controlled component.
interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  isLoading: boolean;
}

// Fix: Remove internal state and rely on props for query value and changes.
export const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange, onSearch, isLoading }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          id="arabic-search"
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="اُكْتُبْ كَلِمَةً عَرَبِيَّةً هُنَا..."
          lang="ar"
          dir="rtl"
          disabled={isLoading}
          className="w-full px-5 py-4 pr-12 text-lg text-right bg-white border-2 border-slate-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:bg-slate-200 font-amiri"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          aria-label="Search"
        >
          <SearchIcon />
        </button>
      </div>
    </form>
  );
};