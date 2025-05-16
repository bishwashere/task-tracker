"use client";
import { useFormStatus } from "react-dom";

export default function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full text-emerald-500 border border-emerald-500 bg-white py-2 rounded-lg hover:bg-emerald-500 hover:text-white transition"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}
