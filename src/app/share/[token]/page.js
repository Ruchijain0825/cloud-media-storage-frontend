"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PublicSharePage() {
  const { token } = useParams();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const resolveShare = async () => {
      try {
        setLoading(true);
        setError("");

      const response = await fetch(
  `http://localhost:8080/api/public-shares/${token}`
);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to open shared file");
        }

        setFile(data);
      } catch (error) {
        console.error("Public share error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      resolveShare();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading shared file...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!file) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">
          {file.fileName}
        </h1>

        {file.mimeType?.startsWith("image/") && (
          <img
            src={file.signedUrl}
            alt={file.fileName}
            className="max-w-full max-h-[70vh] mx-auto object-contain rounded-lg"
          />
        )}

        {file.mimeType === "application/pdf" && (
          <iframe
            src={file.signedUrl}
            title={file.fileName}
            className="w-full h-[70vh] rounded-lg border"
          />
        )}

        {file.mimeType === "text/plain" && (
          <iframe
            src={file.signedUrl}
            title={file.fileName}
            className="w-full h-[70vh] rounded-lg border"
          />
        )}

        {!file.mimeType?.startsWith("image/") &&
          file.mimeType !== "application/pdf" &&
          file.mimeType !== "text/plain" && (
            <div className="py-20 text-center">
              <div className="text-6xl mb-4">📄</div>

              <p className="text-gray-600">
                Preview not available for this file type.
              </p>
            </div>
          )}
      </div>
    </main>
  );
}
