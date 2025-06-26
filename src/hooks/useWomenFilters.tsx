
import { useState, useMemo } from 'react';
import { Woman } from './useWomen';

export interface WomenFilters {
  search: string;
  minAge: number;
  maxAge: number;
  origin: string;
  minHeight: number;
  maxHeight: number;
  nsfw: boolean | null;
}

const initialFilters: WomenFilters = {
  search: '',
  minAge: 18,
  maxAge: 65,
  origin: '',
  minHeight: 150,
  maxHeight: 190,
  nsfw: null,
};

export function useWomenFilters(women: Woman[] = []) {
  const [filters, setFilters] = useState<WomenFilters>(initialFilters);

  const filteredWomen = useMemo(() => {
    return women.filter(woman => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = woman.name.toLowerCase().includes(searchLower);
        const matchesDescription = woman.description?.toLowerCase().includes(searchLower) || false;
        const matchesPersonality = woman.personality?.toLowerCase().includes(searchLower) || false;
        const matchesInterests = woman.interests?.some(interest => 
          interest.toLowerCase().includes(searchLower)
        ) || false;
        
        if (!matchesName && !matchesDescription && !matchesPersonality && !matchesInterests) {
          return false;
        }
      }

      // Age filter
      if (woman.age < filters.minAge || woman.age > filters.maxAge) {
        return false;
      }

      // Origin filter
      if (filters.origin && woman.origin !== filters.origin) {
        return false;
      }

      // Height filter
      if (woman.height) {
        if (woman.height < filters.minHeight || woman.height > filters.maxHeight) {
          return false;
        }
      }

      // NSFW filter
      if (filters.nsfw !== null && woman.nsfw !== filters.nsfw) {
        return false;
      }

      return true;
    });
  }, [women, filters]);

  const updateFilter = (key: keyof WomenFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    filters,
    filteredWomen,
    updateFilter,
    resetFilters,
  };
}
