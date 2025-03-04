"use client"
import { useFormStatus } from "react-dom"

export default function LoginButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full text-blue-500 border border-blue-500 bg-white py-2 rounded-lg hover:bg-blue-500 hover:text-white transition"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  )
}