// hooks/use-party-suggestions.ts
import { useMemo } from 'react';
import { Candidate, PartySuggestion } from '../candidate.types';

export interface UsePartySuggestionsResult {
  partySuggestions: PartySuggestion[];
  getPartyByName: (partyName: string) => PartySuggestion | undefined;
  getTopParties: (count?: number) => PartySuggestion[];
  getAllPartyNames: () => string[];
  hasPartySuggestions: boolean;
}

/**
 * Hook to extract and manage political party suggestions from existing candidates
 * Provides utilities for party autocompletion and suggestion features
 */
export const usePartySuggestions = (candidates: Candidate[]): UsePartySuggestionsResult => {
  const partySuggestions = useMemo(() => {
    const partyMap = new Map<string, PartySuggestion>();
    
    candidates.forEach(candidate => {
      if (candidate.partyName?.trim()) {
        const partyName = candidate.partyName.trim();
        const existing = partyMap.get(partyName);
        
        if (existing) {
          // Increment count for existing party
          existing.candidateCount += 1;
          
          // Update symbol if current candidate has one and existing doesn't
          if (!existing.partySymbol && candidate.partySymbol?.trim()) {
            existing.partySymbol = candidate.partySymbol.trim();
          }
          
          // Keep the most recent/common color (could be enhanced with mode calculation)
          if (candidate.partyColor?.trim()) {
            existing.partyColor = candidate.partyColor.trim();
          }
        } else {
          // Create new party entry
          partyMap.set(partyName, {
            partyName: partyName,
            partyColor: candidate.partyColor?.trim() || '#0066CC',
            partySymbol: candidate.partySymbol?.trim(),
            candidateCount: 1
          });
        }
      }
    });
    
    // Convert to array and sort by popularity then alphabetically
    return Array.from(partyMap.values()).sort((a, b) => {
      // Primary sort: by candidate count (descending)
      if (a.candidateCount !== b.candidateCount) {
        return b.candidateCount - a.candidateCount;
      }
      // Secondary sort: alphabetically (ascending)
      return a.partyName.localeCompare(b.partyName);
    });
  }, [candidates]);

  const getPartyByName = useMemo(() => {
    return (partyName: string): PartySuggestion | undefined => {
      return partySuggestions.find(
        party => party.partyName.toLowerCase() === partyName.toLowerCase()
      );
    };
  }, [partySuggestions]);

  const getTopParties = useMemo(() => {
    return (count: number = 5): PartySuggestion[] => {
      return partySuggestions.slice(0, count);
    };
  }, [partySuggestions]);

  const getAllPartyNames = useMemo(() => {
    return (): string[] => {
      return partySuggestions.map(party => party.partyName);
    };
  }, [partySuggestions]);

  return {
    partySuggestions,
    getPartyByName,
    getTopParties,
    getAllPartyNames,
    hasPartySuggestions: partySuggestions.length > 0
  };
};

/**
 * Hook specifically for party form autocompletion
 * Provides functions to handle party selection and auto-filling
 */
export const usePartyAutoComplete = (
  candidates: Candidate[],
  onPartyChange: (partyName: string) => void,
  onColorChange: (color: string) => void,
  onSymbolChange: (symbol: string) => void
) => {
  const { partySuggestions, getPartyByName } = usePartySuggestions(candidates);

  const handlePartySelection = (partyName: string) => {
    const party = getPartyByName(partyName);
    
    if (party) {
      // Auto-fill party details
      onPartyChange(party.partyName);
      onColorChange(party.partyColor);
      
      // Only set symbol if one exists and current symbol is empty
      if (party.partySymbol) {
        onSymbolChange(party.partySymbol);
      }
    } else {
      // Just set the party name for new parties
      onPartyChange(partyName);
    }
  };

  const filterPartiesByQuery = (query: string) => {
    if (!query.trim()) return partySuggestions;
    
    const lowerQuery = query.toLowerCase();
    return partySuggestions.filter(party =>
      party.partyName.toLowerCase().includes(lowerQuery)
    );
  };

  const getExactMatch = (query: string) => {
    return getPartyByName(query);
  };

  return {
    partySuggestions,
    handlePartySelection,
    filterPartiesByQuery,
    getExactMatch,
    hasPartySuggestions: partySuggestions.length > 0
  };
};
