import React, { useState } from 'react'
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import RegisterCreds from './RegisterCreds';
import RegisterSocial from './RegisterSocial';

const Page = async () => {
    const session = await auth();
    if (session) redirect('/dashboard');

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="p-6 bg-transparent border border-gray-300 rounded-xl shadow-lg text-center w-96">
                <RegisterCreds>
                    <RegisterSocial />
                </RegisterCreds>
            </div>
        </div>
    );
}

export default Page;