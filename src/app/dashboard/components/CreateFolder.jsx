"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { folderSchema } from "@/lib/validation/folder.schema";

const createFolder = async (name, parentId) => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch("http://localhost:8080/api/folder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      parentId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create folder");
  }

  return data;
};

export default function CreateFolderModal({ parentId, onClose }) {
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validation = folderSchema.safeParse({
      name: folderName,
    });

    if (!validation.success) {
      const message = validation.error.issues[0].message;

      setError(message);
      toast.error(message);

      return;
    }

    try {
      setLoading(true);
      setError("");

      await createFolder(
        validation.data.name,
        parentId
      );

      toast.success("Folder created successfully");

      setFolderName("");

      onClose();
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-800">
            Create New Folder
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Folder name
          </label>

          <input
            type="text"
            value={folderName}
            onChange={(event) => {
              setFolderName(event.target.value);
              setError("");
            }}
            placeholder="Enter folder name"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && (
            <p className="text-sm text-red-500 mt-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}