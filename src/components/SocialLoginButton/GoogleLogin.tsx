import { FcGoogle } from "react-icons/fc";

const GoogleLogin = () => {
  return (
    <form
      action={async () => {
        "use server";
      }}
    >
      <button type="submit" className='w-full shadow-sm flex flex-row gap-2 items-center justify-center bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-100 transition'>
        <FcGoogle />
        Continue with Google
      </button>
    </form>
  );
};

export { GoogleLogin };
