"use server";
import { signOut } from "@/lib/auth"

const logOut = async () => {
    await signOut();
}

export default logOut;