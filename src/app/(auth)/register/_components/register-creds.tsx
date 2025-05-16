"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardCheck } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FormSubmitButton from "@/components/common/FormSubmitButton";
import { register } from "@/actions/register";
import { LockKeyhole, ShieldUser, User } from "lucide-react";
import Image from "next/image";

const RegisterCreds = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const registerUser = async (formData: FormData) => {
    // console.log(formData)
    const res = await register(formData);
    if (res?.success) {
      toast.success(res.message);
      router.push("/login");
    } else {
      toast.error(res?.message || "An error occurred");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-xs sm:w-sm md:w-md max-w-full p-8 bg-white border border-gray-200 rounded-2xl shadow-xl text-center">
        {/* Icon & Title */}
        <div className="flex items-center justify-center mb-4">
          <Image src="/logo.png" width="50" height="50" alt="Logo" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Your Account</h1>
        <p className="text-sm text-gray-500 mb-6">Join azent.io and boost your productivity</p>

        {/* Value Reminders */}
        <ul className="text-sm text-gray-600 space-y-1 mb-6 text-left">
          <li>✅ Your data is never sold or shared</li>
          <li>🔒 Industry-grade encryption for all accounts</li>
          <li>📧 No spam – only essential updates</li>
        </ul>

        {/* Sign-Up Form */}
        <form action={registerUser} className="space-y-4">
          {/* Full Name */}
          <div className="relative">
            <span className="absolute top-3 left-3 text-gray-400">
              <User className="w-5 h-5 stroke-[1.5px]" />
            </span>
            <input
              type="text"
              placeholder="Full Name"
              name="name"
              id="name"
              className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <span className="absolute top-3 left-3 text-gray-400">
              <ShieldUser className="w-5 h-5 stroke-[1.5px]" />
            </span>
            <input
              type="email"
              placeholder="Email"
              name="email"
              id="email"
              className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <span className="absolute top-3 left-3 text-gray-400">
              <LockKeyhole className="w-5 h-5 stroke-[1.5px]" />
            </span>
            <input
              type="password"
              placeholder="Password"
              name="password"
              id="password"
              className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <span className="absolute top-3 left-3 text-gray-400">
              <LockKeyhole className="w-5 h-5 stroke-[1.5px]" />
            </span>
            <input
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              id="confirmPassword"
              className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
              required
            />
          </div>

          {/* Submit Button */}
          <FormSubmitButton className="w-full text-white bg-emerald-500 py-2 rounded-lg hover:bg-emerald-600 transition">
            Register
          </FormSubmitButton>
        </form>

        {/* Divider & Child Component (e.g., login links) */}
        <div className="my-6">
          <hr className="border border-gray-300" />
          <div className="mt-4 text-sm text-gray-600">
            {children}
          </div>
        </div>
      </div>
    </div>

  );
};

export default RegisterCreds;
