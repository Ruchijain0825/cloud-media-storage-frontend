"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function GoogleCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get("accessToken");
        const error = searchParams.get("error");

        if (error || !accessToken) {
            toast.error("Google login failed");
            router.replace("/login");
            return;
        }

        localStorage.setItem("accessToken", accessToken);

        toast.success("Google login successful");

        router.replace("/dashboard");
    }, [router, searchParams]);

    return (
        <main className="min-h-screen flex items-center justify-center">
            <p className="text-gray-600">
                Signing you in...
            </p>
        </main>
    );
}