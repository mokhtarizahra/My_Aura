"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function PhonePage() {

  const [phone, setPhone] = useState("");
  const { requestOTP } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    await requestOTP(phone);

    router.push(`/auth/otp?phone=${phone}`);
  };

  return (
    <div>

      <h1>Enter phone</h1>

      <form onSubmit={handleSubmit}>

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="phone"
        />

        <button type="submit">
          Send OTP
        </button>

      </form>

    </div>
  );
}
