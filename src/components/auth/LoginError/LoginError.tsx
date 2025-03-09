"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

const LoginError = () => {
    const searchParams = useSearchParams();
    const error = searchParams?.get('error');

    useEffect(() => {
        if (error) {
            // Handle different error types
            const errorMessages: { [key: string]: string } = {
                CredentialsSignin: 'Invalid username or password',
                OAuthSignin: 'There was an issue with the OAuth provider',
                OAuthAccountNotLinked: 'There was an issue with the OAuth provider',
                default: 'Login failed. Please try again',
            };

            toast.error(errorMessages[error] || errorMessages.default);

            // Clean URL after showing error
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, [error]);
    return (
        <div></div>
    )
}

export default LoginError;