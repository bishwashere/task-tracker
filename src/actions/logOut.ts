"use server";
import { signOut } from "@/lib/auth"
import { redirect } from "next/navigation";

const logOut = async () => {
    await signOut()
    .then(()=> redirect('/login'));
}

export default logOut;