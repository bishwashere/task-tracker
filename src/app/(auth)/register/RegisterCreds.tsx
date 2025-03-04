"use client"
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import { redirect, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';

const RegisterCreds = ({ children }: { children: React.ReactNode }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match !');
            return;
        }
        setLoading(true);
        const postData = axios.post('/api/register', { username: username, email: email, password: password })
            .then((res) => {
                toast.success('User Regisgered! Please login to continue');
                router.push('/login');
            })
            .catch((error) => toast.error(error.response?.data))
            .finally(() => setLoading(false));
        toast.promise(postData, {
            loading: 'Registering user...',
        });
    };

    return (
        <>
            <FontAwesomeIcon icon={faClipboardCheck} className="text-blue-500 w-8 h-8 text-4xl mb-2" />
            <h1 className="text-2xl font-bold mb-4">Task Tracker</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"

                />
                <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-blue-500 border border-blue-500 bg-white py-2 rounded-lg hover:bg-blue-500 hover:text-white transition"
                >
                    Register
                </button>
            </form>
            <hr className='border border-gray-300 my-6' />
            {children}
        </>
    );
}

export default RegisterCreds;