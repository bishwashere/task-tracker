import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import RegisterCreds from "./_components/register-creds";
import RegisterSocial from "./_components/register-social";

const Page = async () => {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <RegisterCreds>
        <RegisterSocial />
      </RegisterCreds>
    </div>
  );
};

export default Page;
