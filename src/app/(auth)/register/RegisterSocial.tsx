import { GitHubLogin } from "@/components/LoginButton/GitHubLogin"
import { GoogleLogin } from "@/components/LoginButton/GoogleLogin"

const RegisterSocial = () => {
    return(
        <>
        <GoogleLogin/>
            <div className='my-4' />
        <GitHubLogin />
        </>
    )
}

export default RegisterSocial;