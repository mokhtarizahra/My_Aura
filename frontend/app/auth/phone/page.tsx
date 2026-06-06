"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const schema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^09\d{9}$/, "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد"),
});

type FormData = z.infer<typeof schema>;

export default function PhonePage() {
  const router = useRouter();
  const { requestOTP } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setErrorMessage("");

    try {
      await requestOTP(data.phone);
      router.push(`/auth/otp?phone=${encodeURIComponent(data.phone)}`);

    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "خطای غیرمنتظره‌ای رخ داد");
    }
  };

  return (
    <div>
      <h1>ورود به حساب کاربری</h1>

      <form onSubmit={handleSubmit(onSubmit)}>

        <label htmlFor="phone" className="sr-only">شماره موبایل خود را وارد کنید</label>

        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          autoFocus
          placeholder="09123456789"
          {...register("phone")}
        />

        {errors.phone && (
          <p style={{ color: "red" }}>{errors.phone.message}</p>
        )}

        {errorMessage && (
          <p style={{ color: "red" }}>{errorMessage}</p>
        )}

        <button type="submit" disabled={isSubmitting }>
          {isSubmitting ? "در حال ارسال..." : "ارسال کد"}
        </button>
      </form>
    </div>
  );

}
