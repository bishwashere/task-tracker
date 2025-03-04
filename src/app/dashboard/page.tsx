import { SignOut } from "@/components/SignOut/SignOut";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const Page = async () => {

    const session = await auth();
    if(!session) redirect('/login')

    return (
        <div>
            <h1>
                Dashboard
            </h1>
            <SignOut />
        </div>
    )
}

export default Page;