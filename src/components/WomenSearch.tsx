
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { WomenFilters } from '../hooks/useWomenFilters';

interface WomenSearchProps {
  filters: WomenFilters;
  onFilterChange: (key: keyof WomenFilters, value: any) => void;
  onResetFilters: () => void;
  availableOrigins: string[];
}

const WomenSearch: React.FC<WomenSearchProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableOrigins,
}) => {
  const [showFilters, setShowFilters] = React.useState(false);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
        <input
          type="text"
          placeholder="Nach Namen, Beschreibung oder Interessen suchen..."
          value={filters.searchTerm}
          onChange={(e) => onFilterChange('searchTerm', e.target.value)}
          className="w-full pl-10 pr-4 py-3 glass rounded-xl text-white placeholder-white/60 bg-white/10 border border-white/20 focus:border-purple-400 focus:outline-none"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 glass-button px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
        
        <button
          onClick={onResetFilters}
          className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
          <span className="text-sm">Reset</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="glass rounded-xl p-4 space-y-4">
          {/* Age Range */}
          <div>
            <label className="block text-white font-medium mb-2">Alter</label>
            <div className="flex space-x-4">
              <input
                type="number"
                placeholder="Min"
                value={filters.minAge}
                onChange={(e) => onFilterChange('minAge', parseInt(e.target.value) || 18)}
                className="flex-1 p-2 glass rounded-lg text-white placeholder-white/60 bg-white/10 border border-white/20"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxAge}
                onChange={(e) => onFilterChange('maxAge', parseInt(e.target.value) || 65)}
                className="flex-1 p-2 glass rounded-lg text-white placeholder-white/60 bg-white/10 border border-white/20"
              />
            </div>
          </div>

          {/* Origin */}
          <div>
            <label className="block text-white font-medium mb-2">Herkunft</label>
            <select
              value={filters.origin}
              onChange={(e) => onFilterChange('origin', e.target.value)}
              className="w-full p-2 glass rounded-lg text-white bg-white/10 border border-white/20"
            >
              <option value="">Alle Herkünfte</option>
              {availableOrigins.map(origin => (
                <option key={origin} value={origin} className="bg-gray-800">
                  {origin}
                </option>
              ))}
            </select>
          </div>

          {/* Height Range */}
          <div>
            <label className="block text-white font-medium mb-2">Größe (cm)</label>
            <div className="flex space-x-4">
              <input
                type="number"
                placeholder="Min"
                value={filters.minHeight}
                onChange={(e) => onFilterChange('minHeight', parseInt(e.target.value) || 150)}
                className="flex-1 p-2 glass rounded-lg text-white placeholder-white/60 bg-white/10 border border-white/20"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxHeight}
                onChange={(e) => onFilterChange('maxHeight', parseInt(e.target.value) || 190)}
                className="flex-1 p-2 glass rounded-lg text-white placeholder-white/60 bg-white/10 border border-white/20"
              />
            </div>
          </div>

          {/* NSFW Filter */}
          <div>
            <label className="block text-white font-medium mb-2">NSFW Content</label>
            <select
              value={filters.nsfw === null ? '' : filters.nsfw.toString()}
              onChange={(e) => {
                const value = e.target.value;
                onFilterChange('nsfw', value === '' ? null : value === 'true');
              }}
              className="w-full p-2 glass rounded-lg text-white bg-white/10 border border-white/20"
            >
              <option value="" className="bg-gray-800">Alle</option>
              <option value="false" className="bg-gray-800">Nein</option>
              <option value="true" className="bg-gray-800">Ja</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default WomenSearch;
