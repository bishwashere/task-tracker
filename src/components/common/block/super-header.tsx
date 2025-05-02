import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";

export default function SuperHeader({
  path,
  label,
}: {
  path: string;
  label?: string;
}) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "w-full p-4 flex items-center max-sm:pb-0",
        label && "justify-between",
      )}
    >
      <button
        onClick={() => router.push(path)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
      >
        <FaArrowLeft className="h-6 w-6" />
        <span className="text-lg font-medium max-sm:hidden">{"Back"}</span>
      </button>
      {label && (
        <>
          <span className="text-2xl font-bold sm:hidden">{label}</span>
          <span></span>
        </>
      )}
    </div>
  );
}
