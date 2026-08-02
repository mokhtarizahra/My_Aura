import { HeroData } from "@/types/hero";

export async function getHeroData(): Promise<HeroData> {
  // 🔴 در آینده، این بخش با درخواست واقعی به بک‌اند جایگزین می‌شود:
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hero-stats`, { cache: 'no-store' });
  // return response.json();

  // 🟢 فعلاً برای نمایش ساختار، یک تأخیر مصنوعی و داده‌ی ساختگی (Mock) برمی‌گردانیم
  await new Promise((resolve) => setTimeout(resolve, 800)); // شبیه‌سازی تأخیر شبکه

  return {
    stats: {
      complexesCount: "+۵۰۰",
      activeAthletes: "+۱۰,۰۰۰",
      proCoaches: "+۱,۲۰۰",
    },
    nearestComplex: {
      name: "مجموعه ورزشی آزادی",
      address: "تهران، بزرگراه آزادی",
      rating: "۴.۸",
      distance: "۲.۳",
      tags: ["فوتبال", "شنا", "بدنسازی"],
    },
  };
}