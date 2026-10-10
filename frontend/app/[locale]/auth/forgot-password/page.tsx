// app/auth/phone/page.tsx
'use client';

import { PhoneForm } from '@/components/auth/PhoneForm';

/**
 * صفحه درخواست کد OTP
 * این صفحه فقط فرم را رندر می‌کند و هیچ منطقی ندارد
 */
export default function PhonePage() {
  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleSuccess = (phone: string) => {
    // اینجا می‌توانید آنالیتیکس یا هر action دیگری اضافه کنید
    console.log(`✅ OTP requested for phone: ${phone}`);
  };

  const handleError = (error: Error) => {
    // اینجا می‌توانید خطا را به سرویس مانیتورینگ بفرستید
    console.error('❌ Phone request error:', error);
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <main
      dir="rtl"
      className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50"
    >
      <PhoneForm
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </main>
  );
}