"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  otp: z.string().regex(/^\d{4}$/, "کد باید دقیقاً ۴ رقم و فقط شامل اعداد باشد"),
});

type FormData = z.infer<typeof schema>;

export default function OTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOTP } = useAuth();
  const phone = searchParams.get("phone");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!phone) {
      router.replace("/auth/phone");
    }
  }, [phone, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!phone) return;

    setErrorMessage("");

    try {
      await verifyOTP(phone, data.otp);
      router.push("/settings/password");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "خطای غیرمنتظره‌ای رخ داد");
    }
  };

  return (
    <div>
      <h1>ورود با کد یکبارمصرف</h1>

      {phone && <p>کد به این شماره ارسال شد: {phone}</p>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="otp">کد چهار رقمی را وارد کنید</label>

        <input
          id="otp"
          type="tel"
          inputMode="numeric"
          autoFocus
          maxLength={4}
          placeholder="مثلاً 1234"
          {...register("otp")}
        />

        {errors.otp && <p style={{ color: "red" }}>{errors.otp.message}</p>}

        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "در حال بررسی..." : "تأیید کد"}
        </button>
      </form>
    </div>
  );
}
