"use client";

import { useRef, useState } from "react";
import { fileSchema } from "@/lib/validation/file.schema";

export default function FileUpload({ currentFolderId }) {
    const inputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [success, setSuccess] = useState("");

    const handleFile = (file) => {
        if (!file) return;

        setError("");
        setSuccess("");

        const validation = fileSchema.safeParse({ file });

        if (!validation.success) {
            const message = validation.error.issues[0].message;

            setError(message);
            setSelectedFile(null);

            return;
        }

        setSelectedFile(validation.data.file);
    };

    const handleInputChange = (event) => {
        const file = event.target.files?.[0];

        handleFile(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();

        setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();

        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();

        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];

        handleFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a file first.");

            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);
            setError("");
            setSuccess("");

            const formData = new FormData();

            formData.append("file", selectedFile);

            if (currentFolderId) {
                formData.append("folderId", currentFolderId);
            }

            const token = localStorage.getItem("accessToken");

            if (!token) {
                setError("Please login again.");
                setIsUploading(false);

                return;
            }

            const xhr = new XMLHttpRequest();

            xhr.open(
                "POST",
                `${process.env.NEXT_PUBLIC_API_URL}/upload`
            );

            xhr.setRequestHeader(
                "Authorization",
                `Bearer ${token}`
            );

            xhr.withCredentials = true;

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round(
                        (event.loaded / event.total) * 100
                    );

                    setUploadProgress(progress);
                }
            };

            xhr.onload = () => {
                setIsUploading(false);

                if (xhr.status >= 200 && xhr.status < 300) {
                    setSuccess("File uploaded successfully!");
                    setSelectedFile(null);
                    setUploadProgress(100);
                } else {
                    let message = "File upload failed.";

                    try {
                        const response = JSON.parse(xhr.responseText);

                        message =
                            response.message ||
                            response.error ||
                            message;
                    } catch {
                        
                    }

                    setError(message);
                }
            };

            xhr.onerror = () => {
                setIsUploading(false);

                setError("Network error. Please try again.");
            };

            xhr.send(formData);
        } catch (error) {
            console.error("Upload error:", error);

            setIsUploading(false);

            setError("Something went wrong during upload.");
        }
    };

    return (
        <div className="w-full">

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
                    isDragging
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-400"
                }`}
            >

                <input
                    ref={inputRef}
                    type="file"
                    hidden
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.txt"
                    onChange={handleInputChange}
                />

                <div className="space-y-2">

                    <p className="text-lg font-semibold text-gray-700">
                        {isDragging
                            ? "Drop your file here"
                            : "Upload a file"}
                    </p>

                    <p className="text-sm text-gray-500">
                        Drag & drop or click to select
                    </p>

                    <p className="text-xs text-gray-400">
                        JPG, PNG, WEBP, PDF, TXT • Max 10 MB
                    </p>

                </div>

            </div>

            {error && (
                <p className="mt-3 text-sm font-medium text-red-500">
                    {error}
                </p>
            )}

            {success && (
                <p className="mt-3 text-sm font-medium text-green-600">
                    {success}
                </p>
            )}

            {selectedFile && (
                <div className="mt-4 rounded-lg border bg-gray-50 p-4">

                    <p className="font-medium text-gray-700">
                        {selectedFile.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    {!isUploading && (
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();

                                handleUpload();
                            }}
                            className="mt-3 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Upload
                        </button>
                    )}

                    {isUploading && (
                        <div className="mt-4">

                            <div className="mb-1 flex justify-between text-sm">

                                <span>
                                    Uploading...
                                </span>

                                <span>
                                    {uploadProgress}%
                                </span>

                            </div>

                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">

                                <div
                                    className="h-full rounded-full bg-blue-600 transition-all"
                                    style={{
                                        width: `${uploadProgress}%`,
                                    }}
                                />

                            </div>

                        </div>
                    )}

                </div>
            )}

        </div>
    );
}