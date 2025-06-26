
import { useState, useMemo } from 'react';
import { Woman } from './useWomen';

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

  const filteredWomen = useMemo(() => {
    if (!women) return [];

    return women.filter(woman => {
      // Search term filter
      if (filters.searchTerm && !woman.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }

      // Age filter
      if (woman.age < filters.minAge || woman.age > filters.maxAge) {
        return false;
      }

      // Height filter
      if (woman.height) {
        if (woman.height < filters.minHeight || woman.height > filters.maxHeight) {
          return false;
        }
      }

      // Interests filter
      if (filters.interests.length > 0 && woman.interests) {
        const hasMatchingInterest = filters.interests.some(filterInterest =>
          woman.interests?.some(womanInterest =>
            womanInterest.toLowerCase().includes(filterInterest.toLowerCase())
          )
        );
        if (!hasMatchingInterest) return false;
      }

      // Origins filter
      if (filters.origins.length > 0 && woman.origin) {
        if (!filters.origins.includes(woman.origin)) {
          return false;
        }
      }

      // Single origin filter
      if (filters.origin && woman.origin) {
        if (woman.origin !== filters.origin) {
          return false;
        }
      }

      // NSFW filter
      if (filters.nsfw !== null && woman.nsfw !== filters.nsfw) {
        return false;
      }

      // Show NSFW filter
      if (!filters.showNsfw && woman.nsfw) {
        return false;
      }

      // Price filter - convert all prices to monthly for comparison
      const monthlyPrice = convertToMonthly(woman.price, woman.pricing_interval);
      if (monthlyPrice < filters.priceRange.min || monthlyPrice > filters.priceRange.max) {
        return false;
      }

      return true;
    });
  }, [women, filters]);

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
