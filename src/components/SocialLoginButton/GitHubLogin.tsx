import { FaGithub } from "react-icons/fa";

const GitHubLogin = () => {
  return (
    <form
      action={async () => {
        "use server";
      }}
    >
      <button type="submit" className='w-full shadow-sm flex flex-row gap-2 items-center justify-center bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-100 transition'>
        <FaGithub />
        Continue with GitHub
      </button>
    </form>
  );
};

export { GitHubLogin };
