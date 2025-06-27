
import { useState, useMemo } from 'react';
import { Woman } from './useWomen';
import { useDebounce } from './useDebounce';

export interface WomenFilters {
  searchTerm: string;
  minAge: number;
  maxAge: number;
  interests: string[];
  origins: string[];
  showNsfw: boolean;
  priceRange: {
    min: number;
    max: number;
  };
  minHeight: number;
  maxHeight: number;
  origin: string;
  nsfw: boolean | null;
}

const DEFAULT_FILTERS: WomenFilters = {
  searchTerm: '',
  minAge: 18,
  maxAge: 99,
  interests: [],
  origins: [],
  showNsfw: true,
  priceRange: {
    min: 0,
    max: 100
  },
  minHeight: 150,
  maxHeight: 190,
  origin: '',
  nsfw: null
};

export function useWomenFilters(women?: Woman[]) {
  const [filters, setFilters] = useState<WomenFilters>(DEFAULT_FILTERS);
  
  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);
  
  // Memoize the debounced filters object
  const debouncedFilters = useMemo(() => ({
    ...filters,
    searchTerm: debouncedSearchTerm
  }), [filters, debouncedSearchTerm]);

  const filteredWomen = useMemo(() => {
    if (!women) return [];

    return women.filter(woman => {
      // Search term filter - use debounced value
      if (debouncedFilters.searchTerm && !woman.name.toLowerCase().includes(debouncedFilters.searchTerm.toLowerCase())) {
        return false;
      }

      // Age filter
      if (woman.age < debouncedFilters.minAge || woman.age > debouncedFilters.maxAge) {
        return false;
      }

      // Height filter
      if (woman.height) {
        if (woman.height < debouncedFilters.minHeight || woman.height > debouncedFilters.maxHeight) {
          return false;
        }
      }

      // Interests filter
      if (debouncedFilters.interests.length > 0 && woman.interests) {
        const hasMatchingInterest = debouncedFilters.interests.some(filterInterest =>
          woman.interests?.some(womanInterest =>
            womanInterest.toLowerCase().includes(filterInterest.toLowerCase())
          )
        );
        if (!hasMatchingInterest) return false;
      }

      // Origins filter
      if (debouncedFilters.origins.length > 0 && woman.origin) {
        if (!debouncedFilters.origins.includes(woman.origin)) {
          return false;
        }
      }

      // Single origin filter
      if (debouncedFilters.origin && woman.origin) {
        if (woman.origin !== debouncedFilters.origin) {
          return false;
        }
      }

      // NSFW filter
      if (debouncedFilters.nsfw !== null && woman.nsfw !== debouncedFilters.nsfw) {
        return false;
      }

      // Show NSFW filter
      if (!debouncedFilters.showNsfw && woman.nsfw) {
        return false;
      }

      // Price filter - convert all prices to monthly for comparison
      const monthlyPrice = convertToMonthly(woman.price, woman.pricing_interval);
      if (monthlyPrice < debouncedFilters.priceRange.min || monthlyPrice > debouncedFilters.priceRange.max) {
        return false;
      }

      return true;
    });
  }, [women, debouncedFilters]);

  const updateFilter = <K extends keyof WomenFilters>(
    key: K,
    value: WomenFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return {
    filters,
    filteredWomen,
    updateFilter,
    resetFilters
  };
}

// Helper function to convert prices to monthly for comparison
function convertToMonthly(price: number, interval: string): number {
  switch (interval) {
    case 'daily':
      return price * 30;
    case 'weekly':
      return price * 4;
    case 'monthly':
      return price;
    case 'yearly':
      return price / 12;
    default:
      return price;
  }
}
