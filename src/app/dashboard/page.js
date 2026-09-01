"use client";

import FileUpload from "./components/FileUpload";
import FileExplorer from "./components/FileExplorer/FileExplorer";
import CreateFolder from "./components/CreateFolder";

import { useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

const fetchStarredItems = async () => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch("http://localhost:8080/api/stars", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch starred items");
  }

  return data;
};

const fetchSharedItems = async () => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch("http://localhost:8080/api/shares", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch shared items");
  }

  return data;
};
const fetchTrashItems = async () => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch("http://localhost:8080/api/trash", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch trash");
  }

  return data;
};

export default function Dashboard() {
  const [currentFolderId, setCurrentFolderId] = useState(null);

  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [sortBy, setSortBy] = useState("name");

  const [viewMode, setViewMode] = useState("list");

  // Current sidebar section
  const [activeSection, setActiveSection] = useState("drive");

  const queryClient = useQueryClient();

  const starredQuery = useQuery({
    queryKey: ["starred-items"],

    queryFn: fetchStarredItems,

    enabled: activeSection === "starred",

    staleTime: 30 * 1000,
  });

  const sharedQuery = useQuery({
    queryKey: ["shared-items"],

    queryFn: fetchSharedItems,

    enabled: activeSection === "shared",

    staleTime: 30 * 1000,
  });
  const trashQuery = useQuery({
    queryKey: ["trash-items"],
    queryFn: fetchTrashItems,
    enabled: activeSection === "trash",
    staleTime: 30 * 1000,
  });

  const handleUploadSuccess = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["root-folders"],
    });

    if (currentFolderId != null) {
      await queryClient.invalidateQueries({
        queryKey: ["folder-children", currentFolderId],
      });
    }

    await queryClient.invalidateQueries({
      queryKey: ["starred-items"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["shared-items"],
    });
  };

  const handleMyDrive = () => {
    setActiveSection("drive");

    setCurrentFolderId(null);

    setSearchQuery("");
  };

  const handleStarred = async () => {
    setActiveSection("starred");

    setCurrentFolderId(null);

    setSearchQuery("");

    await queryClient.invalidateQueries({
      queryKey: ["starred-items"],
    });
  };

  const handleShared = async () => {
    setActiveSection("shared");

    setCurrentFolderId(null);

    setSearchQuery("");

    await queryClient.invalidateQueries({
      queryKey: ["shared-items"],
    });
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);

    setCurrentFolderId(null);

    setSearchQuery("");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r min-h-screen p-5">
        <h1 className="text-xl font-bold text-blue-600 mb-8">Cloud Media</h1>

        <nav className="space-y-2">
        

          <button
            type="button"
            onClick={handleMyDrive}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeSection === "drive"
                ? "bg-blue-50 text-blue-600"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            My Drive
          </button>

          <button
            type="button"
            onClick={handleShared}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeSection === "shared"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            Shared
          </button>


          <button
            type="button"
            onClick={handleStarred}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeSection === "starred"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
             Starred
          </button>

          <button
            type="button"
            onClick={() => handleSectionChange("recent")}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeSection === "recent"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            Recent
          </button>

          <button
            type="button"
            onClick={() => handleSectionChange("trash")}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeSection === "trash"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            Trash
          </button>
        </nav>
      </aside>

      <section className="flex-1 min-w-0">
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between">
          <div className="w-96">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search files and folders..."
              disabled={activeSection !== "drive"}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">User</span>

            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
              U
            </div>
          </div>
        </header>

        {activeSection === "drive" && (
          <div className="p-8">
         

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Drive</h2>

                <p className="text-sm text-gray-500 mt-1">
                  Manage your files and folders
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateFolder(true)}
                  className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-50 transition"
                >
                  Create a new folder
                </button>
              </div>
            </div>

            <div className="bg-white border rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
              <div className="text-sm text-gray-600">Manage your files</div>

              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white"
                >
                  <option value="name">Sort by Name</option>

                  <option value="size">Sort by Size</option>

                  <option value="date">Sort by Date</option>
                </select>

                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 text-sm rounded-lg ${viewMode === "grid" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  ▦ Grid
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 text-sm rounded-lg ${viewMode === "list" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  ☰ List
                </button>
              </div>
            </div>

            <div className="mb-6">
              <FileUpload
                currentFolderId={currentFolderId}
                onUploadSuccess={handleUploadSuccess}
              />
            </div>

            {/* FILE EXPLORER */}

            <FileExplorer
              currentFolderId={currentFolderId}
              setCurrentFolderId={setCurrentFolderId}
              searchQuery={searchQuery}
              sortBy={sortBy}
              viewMode={viewMode}
            />

            {showCreateFolder && (
              <CreateFolder
                parentId={currentFolderId}
                onClose={() => setShowCreateFolder(false)}
              />
            )}
          </div>
        )}

        {activeSection === "starred" && (
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">⭐ Starred</h2>

              <p className="text-sm text-gray-500 mt-1">
                Files and folders you have starred
              </p>
            </div>

            {starredQuery.isLoading && (
              <div className="bg-white border rounded-xl min-h-[300px] flex items-center justify-center">
                <p className="text-gray-500">Loading starred items...</p>
              </div>
            )}

            {starredQuery.isError && (
              <div className="bg-white border rounded-xl min-h-[300px] flex items-center justify-center">
                <p className="text-red-500">
                  {starredQuery.error?.message ||
                    "Failed to load starred items"}
                </p>
              </div>
            )}

            {!starredQuery.isLoading && !starredQuery.isError && (
              <div className="bg-white border rounded-xl overflow-hidden">
                {starredQuery.data?.stars?.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-[minmax(350px,1fr)_150px_150px] px-6 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500">
                      <div>Name</div>

                      <div>Type</div>

                      <div>Starred</div>
                    </div>

                    {starredQuery.data.stars.map((star) => (
                      <div
                        key={`${star.resource_type}-${star.resource_id}`}
                        className="grid grid-cols-[minmax(350px,1fr)_150px_150px] items-center px-6 py-4 border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {star.resource_type === "folder" ? "📁" : "📄"}
                          </span>

                          <span className="font-medium text-gray-800">
                            {star.name || star.resource_id}
                          </span>
                        </div>

                        <div className="text-sm text-gray-500">
                          {star.resource_type === "folder" ? "Folder" : "File"}
                        </div>

                        <div className="text-yellow-500 text-xl">★</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <div className="text-5xl mb-4">☆</div>

                    <p className="text-gray-500">
                      No starred files or folders.
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      Star a file or folder from My Drive.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeSection === "shared" && (
          <div className="p-8">
            {/* TITLE */}

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Shared</h2>

              <p className="text-sm text-gray-500 mt-1">
                Files and folders shared with you
              </p>
            </div>

            {/* LOADING */}

            {sharedQuery.isLoading && (
              <div className="bg-white border rounded-xl min-h-[300px] flex items-center justify-center">
                <p className="text-gray-500">Loading shared files...</p>
              </div>
            )}

            {sharedQuery.isError && (
              <div className="bg-white border rounded-xl min-h-[300px] flex items-center justify-center">
                <p className="text-red-500">
                  {sharedQuery.error?.message || "Failed to load shared files"}
                </p>
              </div>
            )}

            {!sharedQuery.isLoading && !sharedQuery.isError && (
              <div className="bg-white border rounded-xl overflow-hidden">
                {sharedQuery.data?.shares?.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-[minmax(350px,1fr)_150px_150px] px-6 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500">
                      <div>Name</div>

                      <div>Type</div>

                      <div>Permission</div>
                    </div>

                    {sharedQuery.data.shares.map((share) => (
                      <div
                        key={share.id}
                        onClick={() => {
                          if (share.resource_type === "file" && share.url) {
                            window.open(share.url, "_blank");
                          }
                        }}
                        className={`grid grid-cols-[minmax(350px,1fr)_150px_150px] items-center px-6 py-4 border-b last:border-b-0 hover:bg-gray-50 ${
                          share.resource_type === "file" && share.url
                            ? "cursor-pointer"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {share.resource_type === "folder" ? "📁" : "📄"}
                          </span>

                          <span className="font-medium text-gray-800">
                            {share.name || share.resource_id}
                          </span>
                        </div>

                        <div className="text-sm text-gray-500">
                          {share.resource_type === "folder" ? "Folder" : "File"}
                        </div>

                       <div className="flex items-center gap-3">
  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
    {share.role}
  </span>
 {share.resource_type === "file" && share.url && (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();

        try {
          const response = await fetch(share.url);

          if (!response.ok) {
            throw new Error("Failed to download file");
          }

          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = share.name || "download";
          document.body.appendChild(link);
          link.click();
          link.remove();

          URL.revokeObjectURL(blobUrl);
        } catch (error) {
          alert(error.message || "Failed to download file");
        }
      }}
      className="px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
    >
      Download
    </button>
  )}
 
</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <div className="text-5xl mb-4">🤝</div>

                    <p className="text-gray-500">
                      No files have been shared with you.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeSection === "recent" && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900">Recent</h2>

            <p className="text-sm text-gray-500 mt-1">
              Your recently modified files
            </p>

            <div className="mt-6 bg-white border rounded-xl py-20 text-center">
              <div className="text-5xl mb-4">🕘</div>

              <p className="text-gray-500">Recent files will appear here.</p>
            </div>
          </div>
        )}

        {activeSection === "trash" && (
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🗑️ Trash</h2>

              <p className="text-sm text-gray-500 mt-1">
                Deleted files and folders
              </p>
            </div>

            {/* LOADING */}

            {trashQuery.isLoading && (
              <div className="bg-white border rounded-xl min-h-[300px] flex items-center justify-center">
                <p className="text-gray-500">Loading trash...</p>
              </div>
            )}

            {/* ERROR */}

            {trashQuery.isError && (
              <div className="bg-white border rounded-xl min-h-[300px] flex items-center justify-center">
                <p className="text-red-500">
                  {trashQuery.error?.message || "Failed to load trash"}
                </p>
              </div>
            )}

            {/* DATA */}

            {!trashQuery.isLoading && !trashQuery.isError && (
              <div className="bg-white border rounded-xl overflow-hidden">
                {trashQuery.data?.trash?.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-[minmax(350px,1fr)_150px_150px] px-6 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500">
                      <div>Name</div>

                      <div>Type</div>

                      <div>Action</div>
                    </div>

                    {trashQuery.data.trash.map((item) => (
                      <div
                        key={`${item.resource_type}-${item.id}`}
                        className="grid grid-cols-[minmax(350px,1fr)_150px_150px] items-center px-6 py-4 border-b last:border-b-0 hover:bg-gray-50"
                      >
                        {/* NAME */}

                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {item.resource_type === "folder" ? "📁" : "📄"}
                          </span>

                          <span className="font-medium text-gray-800">
                            {item.name}
                          </span>
                        </div>

                        <div className="text-sm text-gray-500">
                          {item.resource_type === "folder" ? "Folder" : "File"}
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const token =
                                  localStorage.getItem("accessToken");

                                const response = await fetch(
                                  "http://localhost:8080/api/trash/restore",
                                  {
                                    method: "POST",

                                    headers: {
                                      "Content-Type": "application/json",

                                      Authorization: `Bearer ${token}`,
                                    },

                                    body: JSON.stringify({
                                      resourceType: item.resource_type,

                                      resourceId: item.id,
                                    }),
                                  },
                                );

                                const data = await response.json();

                                if (!response.ok) {
                                  throw new Error(
                                    data.message || "Failed to restore",
                                  );
                                }

                                await queryClient.invalidateQueries({
                                  queryKey: ["trash-items"],
                                });

                                await queryClient.invalidateQueries({
                                  queryKey: ["root-folders"],
                                });
                              } catch (error) {
                                alert(
                                  error.message || "Failed to restore resource",
                                );
                              }
                            }}
                            className="px-3 py-2 text-sm rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                          >
                            Restore
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <div className="text-5xl mb-4">🗑️</div>

                    <p className="text-gray-500">Trash is empty.</p>

                    <p className="text-sm text-gray-400 mt-1">
                      Deleted files and folders will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
