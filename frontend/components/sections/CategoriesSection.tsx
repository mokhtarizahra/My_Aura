// components/sections/CategoriesSection.tsx
import {
  Activity,
  Dumbbell,
  Heart,
  type LucideIcon,
  Swords,
  Trophy,
  Users,
  Waves,
} from 'lucide-react';
import Link from 'next/link';

import { getCategories } from '@/services/sportsComplexService';
import { CategoryDisplay } from '@/types/sportsComplex';

// نگاشت آیکون‌ها (فقط در کامپوننت، نه در تایپ)
const iconMap: Record<string, LucideIcon> = {
  Trophy,
  Waves,
  Dumbbell,
  Activity,
  Heart,
  Swords,
  Users,
};

export default async function CategoriesSection() {
  const categories = await getCategories();

  return (
    <section className="py-20 container">
      <div className="text-center mb-12 space-y-3">
        <h2 className="text-3xl md:text-4xl font-black">
          دسته‌بندی رشته‌های ورزشی
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          رشته مورد علاقه‌ات رو انتخاب کن و بهترین مجموعه‌ها رو پیدا کن
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] ?? Dumbbell;
          return (
            <Link
              key={cat.id}
              href={`/complexes?category=${cat.id}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />

              <div className="relative space-y-4">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold tracking-tight">{cat.name}</h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
