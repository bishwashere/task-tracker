"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardCheck } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FormSubmitButton from "@/components/common/FormSubmitButton";
import { register } from "@/actions/register";

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
    <>
      <FontAwesomeIcon
        icon={faClipboardCheck}
        className="text-blue-500 w-8 h-8 text-4xl mb-2"
      />
      <h1 className="text-2xl font-bold mb-4">Task Tracker</h1>
      <form action={registerUser} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          name="name"
          id="name"
          // value={name}
          // onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          required
        />
        <input
          type="email"
          placeholder="Email"
          name="email"
          id="email"
          // value={email}
          // onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          required
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          id="password"
          // value={password}
          // onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          name="confirmPassword"
          id="confirmPassword"
          // value={confirmPassword}
          // onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          required
        />
        <FormSubmitButton className="w-full text-blue-500 border border-blue-500 bg-white py-2 rounded-lg hover:bg-blue-500 hover:text-white transition">
          Register
        </FormSubmitButton>
      </form>
      <hr className="border border-gray-300 my-6" />
      {children}
    </>
  );
};

export default RegisterCreds;
