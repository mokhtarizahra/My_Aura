// app/login/page.tsx  (or components/LoginPage.tsx)
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, LogIn, Lock, Mail, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// import {
//   FiEye,
//   FiEyeOff,
//   FiLoader,
//   FiLogIn,
//   FiLock,
//   FiMail,
// } from "react-icons/fi";

// ─── Validation Schema ────────────────────────────────────────────────────────
const loginSchema = z.object({
  phone: z
    .string()
    .min(1, "شماره موبایل الزامی است")
    .refine(
      (val) =>
        /^(?:\+98|0)?9\d{9}$/.test(val),
      { message: "شماره موبایل معتبر ایرانی وارد کنید" }
    ),
  password: z
    .string()
    .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
// ─── Sub-components ───────────────────────────────────────────────────────────

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  icon: React.ReactNode;
  error?: string;
  rightElement?: React.ReactNode;
  registration: ReturnType<typeof useForm<LoginFormValues>>["register"];
  name: keyof LoginFormValues;
}

function InputField({
  id,
  label,
  type = "text",
  placeholder,
  icon,
  error,
  rightElement,
  registration,
  name,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 text-right" dir="rtl">
      <label
        htmlFor={id}
        className="text-sm font-medium text-white/80 tracking-wide"
      >
        {label}
      </label>

      <div className="relative flex items-center">
        {/* icon (right-3) */}
        {icon && (
          <span className="absolute right-3 text-white/40 pointer-events-none">
            {icon}
          </span>
        )}

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`
            w-full rounded-xl bg-white/10 border py-3 text-sm text-white
            placeholder:text-white/30 outline-none transition-all duration-200
            ${icon ? "pr-10" : "pr-4"} ${rightElement ? "pl-10" : "pl-4"}
            focus:ring-2 focus:ring-white/30 focus:bg-white/15
            ${error ? "border-red-400/70" : "border-white/20 hover:border-white/30"}
          `}
          {...registration(name)}
        />

        {/* button*/}
        {rightElement && (
          <span className="absolute left-3">{rightElement}</span>
        )}
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs text-red-400 flex items-center gap-1 mt-0.5"
        >
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPassword } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: any) => {
    setErrorMessage("");
    setIsLoading(true);

    try {

      await loginWithPassword(data.phone, data.password);

      router.replace(redirect || "/dashboard");

    } catch (err: any) {
      const errorText = err.message;

      if (errorText === "Invalid credentials") {
        setErrorMessage("نام کاربری یا رمز عبور نادرست است.");
      } else if (errorText === "Account is not active") {
        setErrorMessage("حساب کاربری شما هنوز فعال نشده است.");
      } else {
        setErrorMessage(errorText || "خطایی رخ داده است. دوباره تلاش کنید.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    // ── Background ──────────────────────────────────────────────────────────
    <main
      dir="rtl"
      className="
        min-h-screen w-full flex items-center justify-center p-4
        bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900
      "
    >
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-700/10 blur-3xl" />
      </div>

      {/* ── Glass Card ──────────────────────────────────────────────────────── */}
      <div
        className="
          relative w-full max-w-sm sm:max-w-md
          rounded-2xl border border-white/15
          bg-white/10 backdrop-blur-xl shadow-2xl
          p-8 sm:p-10
        "
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="
              inline-flex items-center justify-center
              w-14 h-14 rounded-2xl mb-4
              bg-gradient-to-br from-violet-500 to-indigo-500
              shadow-lg shadow-violet-500/30
            "
          >
            <LogIn className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            خوش آمدید
          </h1>
          <p className="mt-1 text-sm text-white/50">
            برای ادامه، وارد حساب کاربری خود شوید
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-5"
        >
          <InputField
            id="phone"
            name="phone"
            label="شماره موبایل"
            placeholder="+989123456789"
            icon={<Phone className="w-4 h-4" />}
            error={errors.phone?.message}
            registration={register}
          />

          <InputField
            id="password"
            name="password"
            label="رمز عبور"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            registration={register}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-white/40 hover:text-white/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
          />

          {/* Forgot password */}
          <div className="flex justify-end -mt-2">
            <a
              href="/forgot-password"
              className="text-xs text-violet-300 hover:text-violet-200 transition-colors underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded"
            >
              رمز عبور را فراموش کرده‌اید؟
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="
              relative mt-1 w-full flex items-center justify-center gap-2
              rounded-xl py-3 px-4 text-sm font-semibold text-white
              bg-gradient-to-r from-violet-600 to-indigo-600
              hover:from-violet-500 hover:to-indigo-500
              active:scale-[0.98] transition-all duration-200
              shadow-lg shadow-violet-700/30
              disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
              focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
            "
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>در حال ورود…</span>
              </>
            ) : (
              <span>ورود</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-white/40">
          حساب کاربری ندارید؟{" "}
          <a
            href="/register"
            className="text-violet-300 hover:text-violet-200 transition-colors hover:underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded"
          >
            ثبت‌ نام کنید
          </a>
        </p>
      </div>
    </main>
  );
}
