
export type SearchCategory = 'all' | 'complex' | 'coach' | 'sport';

export interface SearchParams {
  query: string;
  city: string;
  category: SearchCategory;
}

export interface SearchSuggestion {
  id: string;
  name: string;
  type: 'complex' | 'coach' | 'sport' | 'city';
}

export interface City {
  id: string;
  name: string;
  province: string;
}