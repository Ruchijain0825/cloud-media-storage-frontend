"use client";

import { useEffect, useState } from "react";

export default function TextPreview({ url }) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadText = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error("Failed to load text file");
                }

                const text = await response.text();

                if (isMounted) {
                    setContent(text);
                }
            } catch (error) {
                if (isMounted) {
                    setError(error.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadText();

        return () => {
            isMounted = false;
        };
    }, [url]);

    if (loading) {
        return (
            <div className="py-20 text-gray-500">
                Loading preview...
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-20 text-red-500">
                {error}
            </div>
        );
    }

    return (
        <pre className="w-full max-w-4xl whitespace-pre-wrap break-words bg-gray-50 rounded-lg p-5 text-sm text-gray-700">
            {content}
        </pre>
    );
}