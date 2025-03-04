import { GitHubLogin } from "@/components/SocialLoginButton/GitHubLogin"
import { GoogleLogin } from "@/components/SocialLoginButton/GoogleLogin"

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