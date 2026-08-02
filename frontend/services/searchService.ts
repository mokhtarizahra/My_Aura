import { resolve } from "path";
import { City, SearchSuggestion, SearchCategory } from "../types/search";
import { promises } from "dns";

export async function getCities(): Promise<City[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [
    { id: "1", name: "تهران", province: "تهران" },
    { id: "2", name: "اصفهان", province: "اصفهان" },
    { id: "3", name: "شیراز", province: "فارس" },
    { id: "4", name: "تبریز", province: "آذربایجان شرقی" },
    { id: "5", name: "مشهد", province: "خراسان رضوی" },
  ];
}

export async function getSearchSuggestions(
  query: string,
  category: SearchCategory
): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) return [];
  await new Promise((resolve) => setTimeout(resolve, 200));

  const allMockSuggestions: SearchSuggestion[] = [
    { id: "1", name: "فوتسال", type: "sport" },
    { id: "2", name: "مجموعه ورزشی آزادی", type: "complex" },
    { id: "3", name: "باشگاه بدنسازی قهرمانان", type: "complex" },
    { id: "4", name: "امیر کریمی", type: "coach" },
    { id: "5", name: "سارا محمدی", type: "coach" },
    { id: "6", name: "شنا", type: "sport" },
  ];

  const filtered = allMockSuggestions.filter((s) => {
    const matchsQuery = s.name.toLowerCase().includes(query.toLowerCase());
    if (category === 'all') return matchsQuery;
    return matchsQuery && s.type === category;
  });

  return filtered.slice(0, 5); // Maximum 5 offers
}