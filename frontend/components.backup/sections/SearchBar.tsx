'use client';

import {
  Building2,
  Dumbbell,
  Filter,
  LayoutGrid,
  MapPin,
  Search,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCities, getSearchSuggestions } from '@/services/searchService';
import { City, SearchCategory, SearchSuggestion } from '@/types/search';

const categories: {
  id: SearchCategory;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: 'all', label: 'همه', icon: LayoutGrid },
  { id: 'complex', label: 'مجموعه', icon: Building2 },
  { id: 'coach', label: 'مربی', icon: Users },
  { id: 'sport', label: 'رشته ورزشی', icon: Dumbbell },
];

const getPlaceholder = (category: SearchCategory): string => {
  switch (category) {
    case 'complex':
      return 'نام مجموعه ورزشی...';
    case 'coach':
      return 'نام مربی...';
    case 'sport':
      return 'رشته ورزشی (مثلاً فوتبال)...';
    default:
      return 'جستجو در مجموعه‌ها، مربیان و رشته‌ها...';
  }
};

const getRoute = (category: SearchCategory): string => {
  switch (category) {
    case 'coach':
      return '/coaches';
    case 'sport':
      return '/sports';
    default:
      return '/complexes';
  }
};

export default function SearchBar() {
  const router = useRouter();

  const [query, setQuery] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');

  const [cities, setCities] = useState<City[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  useEffect(() => {
    getCities().then((data) => setCities(data));
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length >= 2) {
        const data = await getSearchSuggestions(query, activeCategory);
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query, activeCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (city) params.set('city', city);

    const route = getRoute(activeCategory);
    router.push(`${route}?${params.toString()}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    if (suggestion.type !== 'city') {
      setActiveCategory(suggestion.type as SearchCategory);
    }
  };

  const handleCategoryChange = (category: SearchCategory) => {
    setActiveCategory(category);
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <section className="relative -mt-16 z-10 container px-4 md:px-6">
      <Card className="shadow-2xl border-border bg-card/95 backdrop-blur-sm">
        <CardContent className="p-4 md:p-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4 border-b border-border pb-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSearch}>
            <div className="grid md:grid-cols-[1fr_1fr_auto] gap-4">
              {/* Search Input with Autocomplete */}
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder={getPlaceholder(activeCategory)}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() =>
                    suggestions.length > 0 && setShowSuggestions(true)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  className="pr-12 pl-4 py-6 rounded-xl bg-background border-border focus:border-primary text-base"
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 max-h-64 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-3 text-right hover:bg-muted transition-colors flex items-center gap-3 border-b border-border last:border-0"
                      >
                        <span className="text-lg">
                          {suggestion.type === 'sport'
                            ? '🏆'
                            : suggestion.type === 'coach'
                              ? '👤'
                              : '🏟️'}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {suggestion.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {suggestion.type === 'sport'
                              ? 'رشته ورزشی'
                              : suggestion.type === 'coach'
                                ? 'مربی'
                                : 'مجموعه'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* City Select */}
              <Select
                value={city}
                onValueChange={(value: string) => setCity(value)}
              >
                <SelectTrigger className="pr-12 pl-4 py-6 rounded-xl bg-background border-border focus:border-primary text-base">
                  <MapPin className="absolute right-4 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <SelectValue placeholder="انتخاب شهر..." />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search Button */}
              <Button
                type="submit"
                className="px-8 py-6 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all h-auto"
              >
                <Filter className="w-5 h-5 ml-2" />
                جستجو
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
