'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold text-destructive">۴۰۳</h1>
      <h2 className="text-2xl font-semibold mt-4">دسترسی ممنوع!</h2>
      <p className="text-muted-foreground mt-2">
        شما دسترسی لازم برای مشاهده این صفحه را ندارید.
      </p>
      <Button className="mt-6" onClick={() => router.push('/')}>
        بازگشت به صفحه اصلی
      </Button>
    </div>
  );
}
