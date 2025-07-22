import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardCheck } from "@fortawesome/free-solid-svg-icons";
import { GoogleLogin } from "@/components/auth/LoginButton/GoogleLogin";
import { GitHubLogin } from "@/components/auth/LoginButton/GitHubLogin";
import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthError } from "next-auth";
import LoginError from "@/components/auth/LoginError/LoginError";
import LoginButton from "@/components/auth/LoginButton/LoginButton";
import { LockKeyhole, ShieldUser } from "lucide-react";
import Image from "next/image";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { method } = await searchParams;
  const session = await auth();

  if (session) redirect("/dashboard");

  if (method === "email")
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-2xl shadow-xl text-center">
          {/* Icon & Title */}
          <div className="flex items-center justify-center mb-4">
            <Image src="/logo.png" width="50" height="50" alt="Logo" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-sm text-gray-500 mb-6">Log in to azent.io</p>

          {/* Value Reminders */}
          <ul className="text-sm text-gray-600 space-y-1 mb-6 text-left">
            <li>🚀 Access your tasks in under 2 minutes</li>
            <li>🔐 Secure & private login</li>
            <li>💡 Stay productive anywhere, anytime</li>
          </ul>

          {/* Login Form */}
          <form
            className="space-y-4"
            action={async (formData) => {
              "use server";
              try {
                await signIn("credentials", formData);
              } catch (error) {
                if (error instanceof AuthError) {
                  return redirect(`/login?error=${error.type}`);
                }
                throw error;
              }
            }}
          >
            {/* Email */}
            <div className="relative">
              <span className="absolute top-3 left-3 text-gray-400">
                <ShieldUser className="w-5 h-5 stroke-[1.5px]" />
              </span>
              <input
                type="email"
                placeholder="Email"
                id="email"
                name="email"
                className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
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
                id="password"
                name="password"
                className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            {/* Login Button */}
            <LoginButton />
          </form>

          {/* Register Redirect */}
          <p className="mt-4 text-sm text-gray-600">
            New user?{" "}
            <Link href="/register" className="text-emerald-600 font-medium hover:underline">
              Create an account
            </Link>
          </p>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300" />
            <span className="mx-2 text-gray-400 text-sm">or</span>
            <div className="flex-grow h-px bg-gray-300" />
          </div>

          {/* Alternative Login */}
          <p className="text-sm text-gray-600">
            Prefer social login?{" "}
            <Link href="/login" className="text-emerald-600 font-medium hover:underline">
              Continue with Google
            </Link>
          </p>
        </div>

        <LoginError />
      </div>
    );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-2xl shadow-xl text-center">
        <div className="flex items-center justify-center mb-4">
          <Image src="/logo.png" width="50" height="50" alt="Logo" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to azent.io</h1>
        <p className="text-sm text-gray-500 mb-6">Simple. Fast. Effective.</p>

        {/* Value Reminders */}
        <ul className="text-sm text-gray-600 space-y-1 mb-6 text-left">
          <li>🚀 Get started in under 2 minutes</li>
          <li>🔐 Secure & private login</li>
          <li>🎉 7-day free trial – no card required</li>
        </ul>

        {/* Login Methods */}
        <div className="space-y-4">
          <GoogleLogin />
          <GitHubLogin />
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-2 text-gray-400 text-sm">or</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        {/* Email Login */}
        <p className="text-sm text-gray-700">
          Prefer email?{" "}
          <Link href="/login?method=email" className="text-emerald-600 font-medium hover:underline">
            Log in with email
          </Link>
        </p>
      </div>

      <LoginError />
    </div>

  );
};
export default Page;
