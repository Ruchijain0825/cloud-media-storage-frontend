"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function Login() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || "Login failed");
                return;
            }

            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("user", JSON.stringify(data.user));

            toast.success(data.message || "Logged in successfully");

            router.push("/dashboard");

            setEmail("");
            setPassword("");
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Something went wrong. Please try again");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href =  `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Cloud Media Storage
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Email
                        </label>

                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="Enter your email"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Password
                        </label>

                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Enter your password"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <div className="my-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-300"></div>

                    <span className="text-sm text-gray-500">
                        OR
                    </span>

                    <div className="h-px flex-1 bg-gray-300"></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                    <span className="text-lg font-bold">G</span>
                    Continue with Google
                </button>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <a
                        href="/signup"
                        className="font-semibold text-blue-600 hover:underline"
                    >
                        Sign up
                    </a>
                </p>

            </div>
        </main>
    );
}