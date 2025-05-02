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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 bg-transparent border border-gray-300 rounded-xl shadow-lg text-center w-96">
          <div className="flex items-center justify-center">
            <FontAwesomeIcon
              icon={faClipboardCheck}
              className="text-blue-500 w-8 h-8 text-4xl mb-2"
            />
          </div>
          <h1 className="text-2xl font-bold mb-4">Task Tracker</h1>
          <form
            className="space-y-4"
            action={async (formData) => {
              "use server";
              try {
                await signIn("credentials", formData);
              } catch (error) {
                if (error instanceof AuthError) {
                  //@ts-expect-error: .....
                  return redirect(`/login?error=${error.type}`);
                }
                throw error;
              }
            }}
          >
            <input
              type="email"
              placeholder="Email"
              id="email"
              name="email"
              // value={username}
              // onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
            <input
              type="password"
              placeholder="Password"
              id="password"
              name="password"
              // value={password}
              // onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
            <LoginButton />
          </form>
          <p className="mt-3 text-sm ml-2">
            New user?{" "}
            <Link href="/register" className="font-bold">
              Create an Account
            </Link>
          </p>
          <hr className="border border-gray-300 my-6" />
          <p className="mt-3 text-sm ml-2">
            Or,{" "}
            <Link href="/login" className="font-bold">
              Login using Google
            </Link>
          </p>
        </div>
        <LoginError />
      </div>
    );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-6 bg-transparent border border-gray-300 rounded-xl shadow-lg text-center w-96">
        <div className="flex items-center justify-center">
          <FontAwesomeIcon
            icon={faClipboardCheck}
            className="text-blue-500 w-8 h-8 text-4xl mb-2"
          />
        </div>
        <h1 className="text-2xl font-bold mb-4">Task Tracker</h1>
        <div className="my-8" />
        <GoogleLogin />
        <div className="my-4" />
        <GitHubLogin />
        <p className="mt-4 text-sm ml-2">
          Or,{" "}
          <Link href="/login?method=email" className="font-bold">
            Login using email
          </Link>
        </p>
        {/* <hr className='border border-gray-300 my-6' /> */}
      </div>
      <LoginError />
    </div>
  );
};
export default Page;
