"use client";

import { useEffect } from "react";

export default function CallbackPage() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("accessToken");

        if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
            window.location.href = "/dashboard";
        } else {
            window.location.href = "/login";
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Signing you in...</p>
        </div>
    );
}