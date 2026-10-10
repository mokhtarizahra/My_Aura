import { SportsCategory } from '@/types/sportsComplex';

export interface CategoryData {
  id: SportsCategory;
  name: string;
  icon: string;
  gradient: string;
}

export const CATEGORIES: CategoryData[] = [
  {
    id: 'football',
    name: 'فوتبال',
    icon: 'Trophy',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    id: 'futsal',
    name: 'فوتسال',
    icon: 'Trophy',
    gradient: 'from-green-600 to-teal-600',
  },
  {
    id: 'swimming',
    name: 'شنا',
    icon: 'Waves',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'fitness',
    name: 'فیتنس',
    icon: 'Dumbbell',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    id: 'basketball',
    name: 'بسکتبال',
    icon: 'Activity',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 'volleyball',
    name: 'والیبال',
    icon: 'Users',
    gradient: 'from-indigo-500 to-blue-600',
  },
  {
    id: 'bodybuilding',
    name: 'بدنسازی',
    icon: 'Dumbbell',
    gradient: 'from-yellow-500 to-orange-600',
  },
  {
    id: 'yoga',
    name: 'یوگا',
    icon: 'Heart',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    id: 'pilates',
    name: 'پیلاتس',
    icon: 'Heart',
    gradient: 'from-pink-600 to-purple-600',
  },
  {
    id: 'tennis',
    name: 'تنیس',
    icon: 'Activity',
    gradient: 'from-lime-500 to-green-600',
  },
  {
    id: 'martial-arts',
    name: 'رزمی',
    icon: 'Swords',
    gradient: 'from-red-500 to-rose-600',
  },
];

export const getCategoryById = (
  id: SportsCategory
): CategoryData | undefined => {
  return CATEGORIES.find((cat) => cat.id === id);
};

export const getCategoryName = (): string[] => {
  return CATEGORIES.map((cat) => cat.name);
};
