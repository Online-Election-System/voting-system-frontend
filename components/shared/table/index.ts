// components/shared/table/index.ts
export { useTableSearch } from './hooks/use-table-search';

export { SearchInput }      from './components/SearchInput';
export { FilterControls }   from './components/FilterControls';
export { FilterSelect }     from './components/FilterSelect';
export { SortableHeader }   from './components/SortableHeader';
export { ResultsSummary }   from './components/ResultSummary';
export { TablePagination }  from './components/TablePagination';

// re-export shared types if you need them outside
export type { FilterOption, SortConfig } from './types/types';