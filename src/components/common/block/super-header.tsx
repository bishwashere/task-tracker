import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";

export default function SuperHeader({
  path,
  label,
  onBackClick
}: {
  path?: string;
  label?: string;
  onBackClick?: () => void;
}) {
  const router = useRouter();

  return (
    <div className="w-full p-4 flex items-center gap-3 max-sm:pb-0">
      <button
        onClick={() => path ? router.push(path) : onBackClick?.()}
        className="flex shrink-0 items-center space-x-2 text-gray-700 hover:text-gray-900"
      >
        <FaArrowLeft className="h-6 w-6" />
        <span className="text-lg font-medium max-sm:hidden">Back</span>
      </button>
      {label && (
        <span className="min-w-0 truncate text-xl font-bold sm:hidden">{label}</span>
      )}
    </div>
  );
}
