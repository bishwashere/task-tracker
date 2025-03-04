import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import { GoogleLogin } from '@/components/SocialLoginButton/GoogleLogin';
import { GitHubLogin } from '@/components/SocialLoginButton/GitHubLogin';
import { auth, signIn } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { executeAction } from '@/lib/executeActions';

const Page = async () => {
    const session = await auth();
    if(session) redirect('/dashboard');

     return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="p-6 bg-transparent border border-gray-300 rounded-xl shadow-lg text-center w-96">
            <FontAwesomeIcon icon={faClipboardCheck} className="text-blue-500 w-8 h-8 text-4xl mb-2" />
            <h1 className="text-2xl font-bold mb-4">Task Tracker</h1>
            <form className="space-y-4"
                action={async (formData:FormData) => {
                    "use server";
                    await executeAction({
                        actionFn: async () => {
                            await signIn("credentials", formData)
                        }
                    })
                  }}
            >
                <input
                type="text"
                placeholder="Username"
                id="username"
                name="username"
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
                <button
                type="submit"
                className="w-full text-blue-500 border border-blue-500 bg-white py-2 rounded-lg hover:bg-blue-500 hover:text-white transition"
                >
                Login
                </button>
            </form>
                <p className='mt-3 text-sm ml-2'>New user? <Link href="/register" className='font-bold'>Create an Account</Link></p>
            <hr className='border border-gray-300 my-6' />
            <GoogleLogin />
            <div className='my-4' />
            <GitHubLogin />
            </div>
        </div>
        );
    }

export default Page;