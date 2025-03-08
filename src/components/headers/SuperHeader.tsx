import { useRouter } from 'next/navigation';

export default function SuperHeader({ path }:{path:string}) {
  const router = useRouter();

  return (
    <div className="w-full p-4 flex items-center">
      <button
        onClick={() => router.push(path)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="text-lg font-medium">Back</span>
      </button>
    </div>
  );
}
