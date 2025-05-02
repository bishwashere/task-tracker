import { GitHubLogin } from "@/components/auth/LoginButton/GitHubLogin";
import { GoogleLogin } from "@/components/auth/LoginButton/GoogleLogin";

const RegisterSocial = () => {
  return (
    <>
      <GoogleLogin />
      <div className="my-4" />
      <GitHubLogin />
    </>
  );
};

export default RegisterSocial;
