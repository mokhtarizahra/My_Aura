"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// اسکیمای اعتبارسنجی با پیام‌های فارسی
const schema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^09\d{9}$/, "شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد"),
  password: z
    .string()
    .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithPassword, user } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const redirect = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    if (user) {
      router.replace(redirect);
    }
  }, [user, router, redirect]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setErrorMessage("");
    try {
      await loginWithPassword(data.phone, data.password);
      router.replace(redirect);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "خطایی در ورود رخ داد");
    }
  };

  return (
    // افزودن dir="rtl" برای راست‌چین شدن کل صفحه
    <div style={{ maxWidth: 400, margin: "80px auto", fontFamily: "tahoma, sans-serif" }} dir="rtl">
      <h1>ورود به حساب کاربری</h1>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        
        <label htmlFor="phone">شماره موبایل</label>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          {...register("phone")}
          style={{ padding: "8px" }}
        />
        {errors.phone && <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.phone.message}</p>}

        <label htmlFor="password">رمز عبور</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="رمز عبور خود را وارد کنید"
            {...register("password")}
            style={{ flex: 1, padding: "8px" }}
          />
          <button type="button" onClick={() => setShowPassword(v => !v)}>
            {showPassword ? "مخفی" : "نمایش"}
          </button>
        </div>
        {errors.password && <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.password.message}</p>}

        {errorMessage && <p style={{ color: "red", textAlign: "center" }}>{errorMessage}</p>}

        <button type="submit" disabled={isSubmitting} style={{ padding: "10px", cursor: "pointer" }}>
          {isSubmitting ? "در حال ورود..." : "ورود"}
        </button>
      </form>

      <p style={{ marginTop: 20, textAlign: "center" }}>
        مایل به ورود با کد یک‌بار مصرف هستید؟{" "}
        <Link href="/auth/phone" style={{ color: "blue", textDecoration: "underline" }}>
          ورود با OTP
        </Link>
      </p>
    </div>
  );
}
