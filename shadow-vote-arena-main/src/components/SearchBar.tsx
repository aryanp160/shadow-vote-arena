
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { FirebaseQuestion } from '@/services/firebase';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  onClear: () => void;
  isSearching: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  isSearching
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onClear();
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for similar battles..."
              className="w-full bg-black/60 border border-cyan-400/30 rounded-xl pl-12 pr-12 py-4 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none backdrop-blur-sm font-mono"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!searchTerm.trim() || isSearching}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white px-6 py-4 rounded-xl font-bold transition-all duration-200 transform hover:scale-105"
          >
            {isSearching ? 'SEARCHING...' : 'HUNT'}
          </button>
        </div>
      </form>
    </div>
  );
};
