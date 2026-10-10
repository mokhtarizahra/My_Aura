import { Building2, MapPin, Search, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getHeroData } from '@/services/heroService';

export default async function HeroSection() {
  // Receiving data from the service layer
  const data = await getHeroData();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 pt-20 pb-32">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                بزرگترین پلتفرم رزرو مجموعه‌های ورزشی
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
              ورزش مورد علاقه‌ات رو
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                همین الان رزرو کن
              </span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              از فوتبال و شنا تا یوگا و بدنسازی، بهترین مجموعه‌های ورزشی شهرت رو
              پیدا کن، مقایسه کن و در چند ثانیه رزرو کن.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <Link href="/complexes" className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  جستجوی مجموعه‌ها
                </Link>
              </Button>

              <Button
                asChild
                variant="secondary"
                size="lg"
                className="hover:scale-105 transition-all"
              >
                <Link href="/coaches" className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  مشاهده مربیان
                </Link>
              </Button>
            </div>

            {/* Stats - استفاده از داده‌های داینامیک */}
            <div className="flex flex-wrap gap-8 pt-4">
              <StatItem
                icon={Building2}
                value={data.stats.complexesCount}
                label="مجموعه ورزشی"
                iconBg="bg-primary/10"
                iconColor="text-primary"
              />
              <StatItem
                icon={Users}
                value={data.stats.activeAthletes}
                label="ورزشکار فعال"
                iconBg="bg-accent/10"
                iconColor="text-accent-foreground"
              />
              <StatItem
                icon={Trophy}
                value={data.stats.proCoaches}
                label="مربی حرفه‌ای"
                iconBg="bg-secondary/10"
                iconColor="text-secondary-foreground"
              />
            </div>
          </div>

          {/* Visual Element (Card) - استفاده از داده‌های داینامیک */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
              <div className="absolute top-10 right-10 w-64 h-64 bg-primary/30 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent/40 rounded-full blur-2xl animate-pulse delay-700" />

              <Card className="relative shadow-2xl border-border bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-bold">نزدیک‌ترین مجموعه</div>
                      <div className="text-sm text-muted-foreground">
                        {data.nearestComplex.address}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-muted text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        امتیاز
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {data.nearestComplex.rating} ⭐
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-muted text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        فاصله
                      </div>
                      <div className="text-lg font-bold">
                        {data.nearestComplex.distance} km
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {data.nearestComplex.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-primary/10 text-primary hover:bg-primary/20 border-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Statistics auxiliary component
function StatItem({
  icon: Icon,
  value,
  label,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
      >
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
