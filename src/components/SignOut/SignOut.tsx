"use client";

import { signOut } from "next-auth/react";

const SignOut = () => {
  const handleSignOut = async () => { await signOut(); };

  return (
    <div className="flex justify-center">
      <button className=" bg-red-800 text-white" onClick={handleSignOut}>
        Sign Out
      </button>
    </div>
  );
};

export { SignOut };
