"use client";

import FileUpload from "./components/FileUpload";
import FileExplorer from "./components/FileExplorer/FileExplorer";
import CreateFolder from "./components/CreateFolder";
import PreviewModal from "./components/FileExplorer/components/PreviewModal";
import { toggleStar } from "./components/FileExplorer/apis/star.api";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const fetchStarredItems = async () => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/stars`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch starred items"
    );
  }

  return data;
};

const fetchSharedItems = async () => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/shares`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch shared items"
    );
  }

  return data;
};

const fetchTrashItems = async () => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/trash`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch trash"
    );
  }

  return data;
};

const fetchRecentFiles = async () => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Authorization token required");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/recent`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch recent files"
    );
  }

  return data;
};

export default function Dashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentFolderId, setCurrentFolderId] =
    useState(null);

  const [showCreateFolder, setShowCreateFolder] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [sortBy, setSortBy] =
    useState("name");

  const [viewMode, setViewMode] =
    useState("list");

  const [activeSection, setActiveSection] =
    useState("drive");

  const [userEmail, setUserEmail] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [starLoadingId, setStarLoadingId] =
    useState(null);

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const [showAccountModal, setShowAccountModal] =
    useState(false);

  const [previewFile, setPreviewFile] =
    useState(null);

  const profileMenuRef = useRef(null);

  useEffect(() => {
    const token =
      localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      try {
        const user =
          JSON.parse(storedUser);

        setUserEmail(
          user?.email || ""
        );
      } catch (error) {
        console.error(
          "Failed to read user:",
          error
        );
      }
    }
  }, [router]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(
          event.target
        )
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowProfileMenu(false);
        setShowAccountModal(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

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

  const recentQuery = useQuery({
    queryKey: ["recent-files"],
    queryFn: fetchRecentFiles,
    enabled: activeSection === "recent",
    staleTime: 30 * 1000,
  });

  const handleUploadSuccess = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["root-folders"],
    });

    if (currentFolderId != null) {
      await queryClient.invalidateQueries({
        queryKey: [
          "folder-children",
          currentFolderId,
        ],
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
    setShowProfileMenu(false);
  };

  const handleStarred = async () => {
    setActiveSection("starred");
    setCurrentFolderId(null);
    setSearchQuery("");
    setShowProfileMenu(false);

    await queryClient.invalidateQueries({
      queryKey: ["starred-items"],
    });
  };

  const handleShared = async () => {
    setActiveSection("shared");
    setCurrentFolderId(null);
    setSearchQuery("");
    setShowProfileMenu(false);

    await queryClient.invalidateQueries({
      queryKey: ["shared-items"],
    });
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setCurrentFolderId(null);
    setSearchQuery("");
    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    setShowAccountModal(false);

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "refreshToken"
    );

    localStorage.removeItem(
      "user"
    );

    queryClient.clear();

    router.replace("/login");
  };

  const handleUnstar = async (star) => {
    const resourceType =
      star.resource_type;

    const resourceId =
      star.resource_id;

    const key =
      `${resourceType}-${resourceId}`;

    try {
      setStarLoadingId(key);

      await toggleStar(
        resourceType,
        resourceId,
        true
      );

      queryClient.setQueryData(
        ["starred-items"],
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            stars:
              oldData.stars?.filter(
                (item) =>
                  !(
                    item.resource_type ===
                      resourceType &&
                    item.resource_id ===
                      resourceId
                  )
              ),
          };
        }
      );

      await queryClient.invalidateQueries({
        queryKey: ["starred-items"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["root-folders"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["folder-children"],
      });
    } catch (error) {
      console.error(
        "Unstar error:",
        error
      );

      alert(
        error.message ||
          "Failed to remove star"
      );
    } finally {
      setStarLoadingId(null);
    }
  };

  const handleStarredPreview = (star) => {
    if (
      star.resource_type !==
      "file"
    ) {
      return;
    }

    const fileUrl =
      star.url ||
      star.file_url ||
      star.public_url ||
      star.storage_url;

    if (!fileUrl) {
      alert(
        "Preview URL is not available for this file."
      );
      return;
    }

    setSelectedFile({
      ...star,
      id: star.resource_id,
      name:
        star.name ||
        star.resource_id,
      url: fileUrl,
    });
  };

  const closePreview = () => {
    setSelectedFile(null);
  };

  const avatarLetter =
    userEmail
      ? userEmail
          .charAt(0)
          .toUpperCase()
      : "U";

  return (
    <>
      <main className="min-h-screen bg-[#f8fafc] flex text-slate-900 overflow-x-hidden">

        {/* SIDEBAR */}

        <aside className="w-[180px] sm:w-[220px] lg:w-[250px] shrink-0 bg-white border-r border-slate-200 min-h-screen">

          <div className="px-3 sm:px-4 lg:px-6 pt-5 sm:pt-7">

            <div className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-10">

              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg sm:text-xl shadow-sm">
                ☁
              </div>

              <h1 className="text-base sm:text-xl font-bold text-blue-600 truncate">
                Cloud Media
              </h1>

            </div>

            <nav className="space-y-1">

              <button
                type="button"
                onClick={handleMyDrive}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl text-sm transition ${
                  activeSection === "drive"
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-lg shrink-0">
                  ⌂
                </span>

                <span className="truncate">
                  My Drive
                </span>
              </button>

              <button
                type="button"
                onClick={handleShared}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl text-sm transition ${
                  activeSection === "shared"
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-lg shrink-0">
                  ♧
                </span>

                <span className="truncate">
                  Shared
                </span>
              </button>

              <button
                type="button"
                onClick={handleStarred}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl text-sm transition ${
                  activeSection === "starred"
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-lg shrink-0">
                  ☆
                </span>

                <span className="truncate">
                  Starred
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSectionChange("recent")
                }
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl text-sm transition ${
                  activeSection === "recent"
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-lg shrink-0">
                  ◷
                </span>

                <span className="truncate">
                  Recent
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSectionChange("trash")
                }
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl text-sm transition ${
                  activeSection === "trash"
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-lg shrink-0">
                  ♜
                </span>

                <span className="truncate">
                  Trash
                </span>
              </button>

            </nav>
          </div>
        </aside>

        {/* MAIN */}

        <section className="flex-1 min-w-0 overflow-hidden">

          {/* HEADER */}

          <header className="min-h-[76px] bg-white border-b border-slate-200 px-3 sm:px-5 lg:px-8 py-3 flex items-center justify-between gap-3">

            <div className="w-full max-w-[560px] min-w-0">

              <div className="relative">

                <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  ⌕
                </span>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search files and folders..."
                  disabled={
                    activeSection !== "drive"
                  }
                  className="w-full h-11 pl-10 sm:pl-11 pr-3 sm:pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none transition focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100 disabled:text-slate-400"
                />

              </div>
            </div>

            <div
              ref={profileMenuRef}
              className="relative ml-1 sm:ml-6 shrink-0"
            >

              <button
                type="button"
                onClick={() =>
                  setShowProfileMenu(
                    (previous) =>
                      !previous
                  )
                }
                className="flex items-center gap-2 sm:gap-3 px-1 sm:px-2 py-1.5 rounded-xl hover:bg-slate-50 transition"
              >

                <span className="hidden sm:block text-sm text-slate-600 max-w-[220px] truncate">
                  {userEmail || "User"}
                </span>

                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold shadow-sm">
                  {avatarLetter}
                </div>

                <span
                  className={`text-xs text-slate-400 transition-transform ${
                    showProfileMenu
                      ? "rotate-180"
                      : ""
                  }`}
                >
                  ▼
                </span>

              </button>

              {showProfileMenu && (

                <div className="absolute right-0 top-14 z-[80] w-[calc(100vw-24px)] sm:w-72 max-w-72 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">

                  <div className="px-4 py-4 border-b border-slate-100">

                    <div className="flex items-center gap-3">

                      <div className="w-11 h-11 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                        {avatarLetter}
                      </div>

                      <div className="min-w-0">

                        <p className="font-semibold text-slate-800 truncate">
                          {userEmail || "User"}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          Cloud Media account
                        </p>

                      </div>
                    </div>
                  </div>

                  <div className="p-2">

                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-600">

                      <span className="text-lg">
                        👤
                      </span>

                      <div className="min-w-0">

                        <p className="font-medium text-slate-800 truncate">
                          {userEmail || "User"}
                        </p>

                        <p className="text-xs text-slate-400">
                          Signed in
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowAccountModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <span className="text-lg">
                        ⚙️
                      </span>

                      <span>
                        Account
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <span className="text-lg">
                        🚪
                      </span>

                      <span>
                        Logout
                      </span>
                    </button>

                  </div>
                </div>
              )}
            </div>
          </header>

          {/* MY DRIVE */}

          {activeSection === "drive" && (

            <div className="p-4 sm:p-6 lg:p-8 min-w-0">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">

                <div className="min-w-0">

                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    My Drive
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Manage your files and folders
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateFolder(true)
                  }
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition shadow-sm"
                >
                  ＋ New Folder
                </button>

              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

                <div className="flex items-center gap-2">

                  <span className="text-sm text-slate-500">
                    Sort:
                  </span>

                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(
                        event.target.value
                      )
                    }
                    className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-400"
                  >
                    <option value="name">
                      Name
                    </option>

                    <option value="date">
                      Date
                    </option>

                    <option value="size">
                      Size
                    </option>
                  </select>

                </div>

                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 w-fit">

                  <button
                    type="button"
                    onClick={() =>
                      setViewMode("grid")
                    }
                    className={`px-3 py-2 text-sm rounded-lg ${
                      viewMode === "grid"
                        ? "bg-slate-100 text-slate-900 font-medium"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    ▦ Grid
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setViewMode("list")
                    }
                    className={`px-3 py-2 text-sm rounded-lg ${
                      viewMode === "list"
                        ? "bg-slate-100 text-slate-900 font-medium"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    ☰ List
                  </button>

                </div>
              </div>

              <div className="mb-6 min-w-0">

                <FileUpload
                  currentFolderId={
                    currentFolderId
                  }
                  onUploadSuccess={
                    handleUploadSuccess
                  }
                />

              </div>

              <div className="min-w-0 overflow-hidden">

                <FileExplorer
                  currentFolderId={
                    currentFolderId
                  }
                  setCurrentFolderId={
                    setCurrentFolderId
                  }
                  searchQuery={
                    searchQuery
                  }
                  sortBy={sortBy}
                  viewMode={viewMode}
                />

              </div>

              {showCreateFolder && (

                <CreateFolder
                  parentId={
                    currentFolderId
                  }
                  onClose={() =>
                    setShowCreateFolder(false)
                  }
                />

              )}

            </div>
          )}

          {/* STARRED */}

          {activeSection === "starred" && (

            <div className="p-4 sm:p-6 lg:p-8 min-w-0">

              <div className="mb-7">

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Starred
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Files and folders you have starred
                </p>

              </div>

              {starredQuery.isLoading && (

                <div className="bg-white border border-slate-200 rounded-2xl min-h-[300px] flex items-center justify-center">

                  <p className="text-slate-500">
                    Loading starred items...
                  </p>

                </div>

              )}

              {starredQuery.isError && (

                <div className="bg-white border border-red-200 rounded-2xl min-h-[300px] flex items-center justify-center p-5">

                  <p className="text-red-500 text-center">
                    {starredQuery.error?.message ||
                      "Failed to load starred items"}
                  </p>

                </div>

              )}

              {!starredQuery.isLoading &&
                !starredQuery.isError && (

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

                  {starredQuery.data?.stars?.length > 0 ? (

                    <div className="overflow-x-auto">

                      <div className="min-w-[520px]">

                        <div className="grid grid-cols-[minmax(0,1fr)_90px_80px] px-4 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-400">

                          <div>
                            Name
                          </div>

                          <div>
                            Type
                          </div>

                          <div>
                            Action
                          </div>

                        </div>

                        {starredQuery.data.stars.map(
                          (star) => {

                            const key =
                              `${star.resource_type}-${star.resource_id}`;

                            const isRemoving =
                              starLoadingId === key;

                            return (

                              <div
                                key={key}
                                className="grid grid-cols-[minmax(0,1fr)_90px_80px] items-center px-4 sm:px-6 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition"
                              >

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStarredPreview(
                                      star
                                    )
                                  }
                                  disabled={
                                    star.resource_type !==
                                    "file"
                                  }
                                  className={`flex items-center gap-3 min-w-0 text-left ${
                                    star.resource_type ===
                                    "file"
                                      ? "cursor-pointer"
                                      : "cursor-default"
                                  }`}
                                >

                                  <div className="w-10 h-10 shrink-0 rounded-xl bg-yellow-50 flex items-center justify-center text-xl">
                                    {star.resource_type ===
                                    "folder"
                                      ? "📁"
                                      : "📄"}
                                  </div>

                                  <span className="font-medium text-slate-800 truncate min-w-0">
                                    {star.name ||
                                      star.resource_id}
                                  </span>

                                </button>

                                <div className="text-sm text-slate-500 truncate">
                                  {star.resource_type ===
                                  "folder"
                                    ? "Folder"
                                    : "File"}
                                </div>

                                <div className="flex justify-start">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUnstar(star)
                                    }
                                    disabled={
                                      isRemoving
                                    }
                                    title="Remove from Starred"
                                    aria-label="Remove from Starred"
                                    className="w-9 h-9 flex items-center justify-center rounded-lg text-yellow-500 hover:bg-yellow-50 hover:text-yellow-600 transition disabled:opacity-50"
                                  >
                                    ★
                                  </button>

                                </div>

                              </div>
                            );
                          }
                        )}

                      </div>

                    </div>

                  ) : (

                    <div className="py-20 text-center px-5">

                      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-yellow-50 text-yellow-400 flex items-center justify-center text-3xl">
                        ☆
                      </div>

                      <p className="font-medium text-slate-700">
                        No starred files or folders
                      </p>

                      <p className="text-sm text-slate-400 mt-1">
                        Star a file or folder from My Drive.
                      </p>

                    </div>

                  )}

                </div>
              )}

            </div>
          )}

          {/* SHARED */}

          {activeSection === "shared" && (

            <div className="p-4 sm:p-6 lg:p-8 min-w-0">

              <div className="mb-7">

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Shared
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Files and folders shared with you
                </p>

              </div>

              {sharedQuery.isLoading && (

                <div className="bg-white border border-slate-200 rounded-2xl min-h-[300px] flex items-center justify-center">

                  <p className="text-slate-500">
                    Loading shared files...
                  </p>

                </div>

              )}

              {sharedQuery.isError && (

                <div className="bg-white border border-red-200 rounded-2xl min-h-[300px] flex items-center justify-center p-5">

                  <p className="text-red-500 text-center">
                    {sharedQuery.error?.message ||
                      "Failed to load shared files"}
                  </p>

                </div>

              )}

              {!sharedQuery.isLoading &&
                !sharedQuery.isError && (

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

                  {sharedQuery.data?.shares?.length > 0 ? (

                    <div className="overflow-x-auto">

                      <div className="min-w-[580px]">

                        <div className="grid grid-cols-[minmax(0,1fr)_80px_minmax(100px,180px)] px-4 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-400">

                          <div>
                            Name
                          </div>

                          <div>
                            Type
                          </div>

                          <div>
                            Permission
                          </div>

                        </div>

                        {sharedQuery.data.shares.map(
                          (share) => (

                            <div
                              key={share.id}
                              onClick={() => {

                                if (
                                  share.resource_type ===
                                    "file" &&
                                  share.url
                                ) {
                                  setPreviewFile({
                                    name: share.name,
                                    url: share.url,
                                    mime_type:
                                      share.mime_type,
                                  });
                                }

                              }}
                              className={`grid grid-cols-[minmax(0,1fr)_80px_minmax(100px,180px)] items-center px-4 sm:px-6 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition ${
                                share.resource_type ===
                                  "file" &&
                                share.url
                                  ? "cursor-pointer"
                                  : ""
                              }`}
                            >

                              <div className="flex items-center gap-3 min-w-0">

                                <div className="w-10 h-10 shrink-0 rounded-xl bg-violet-50 flex items-center justify-center text-xl">
                                  {share.resource_type ===
                                  "folder"
                                    ? "📁"
                                    : "📄"}
                                </div>

                                <span className="font-medium text-slate-800 truncate min-w-0">
                                  {share.name ||
                                    share.resource_id}
                                </span>

                              </div>

                              <div className="text-sm text-slate-500 truncate">
                                {share.resource_type ===
                                "folder"
                                  ? "Folder"
                                  : "File"}
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">

                                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                                  {share.role}
                                </span>

                                {share.resource_type ===
                                  "file" &&
                                  share.url && (

                                  <button
                                    type="button"
                                    onClick={async (
                                      event
                                    ) => {

                                      event.stopPropagation();

                                      try {

                                        const response =
                                          await fetch(
                                            share.url
                                          );

                                        if (
                                          !response.ok
                                        ) {
                                          throw new Error(
                                            "Failed to download file"
                                          );
                                        }

                                        const blob =
                                          await response.blob();

                                        const blobUrl =
                                          URL.createObjectURL(
                                            blob
                                          );

                                        const link =
                                          document.createElement(
                                            "a"
                                          );

                                        link.href =
                                          blobUrl;

                                        link.download =
                                          share.name ||
                                          "download";

                                        document.body.appendChild(
                                          link
                                        );

                                        link.click();

                                        link.remove();

                                        URL.revokeObjectURL(
                                          blobUrl
                                        );

                                      } catch (
                                        error
                                      ) {

                                        alert(
                                          error.message ||
                                            "Failed to download file"
                                        );

                                      }

                                    }}
                                    className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0"
                                  >
                                    Download
                                  </button>

                                )}

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  ) : (

                    <div className="py-20 text-center px-5">

                      <div className="text-5xl mb-4">
                        ♧
                      </div>

                      <p className="text-slate-500">
                        No files have been shared with you.
                      </p>

                    </div>

                  )}

                </div>
              )}

            </div>
          )}

          {/* SHARED PREVIEW */}

          {previewFile && (

            <div
              className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-3 sm:p-6"
              onClick={() =>
                setPreviewFile(null)
              }
            >

              <div
                className="w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >

                <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-200">

                  <div className="min-w-0">

                    <h3 className="text-lg font-semibold text-slate-900 truncate">
                      {previewFile.name}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      File Preview
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPreviewFile(null)
                    }
                    className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  >
                    ✕
                  </button>

                </div>

                <div className="p-3 sm:p-6 max-h-[75vh] overflow-auto bg-slate-50">

                  {previewFile.mime_type?.startsWith(
                    "image/"
                  ) && (

                    <div className="flex items-center justify-center">

                      <img
                        src={previewFile.url}
                        alt={previewFile.name}
                        className="max-w-full max-h-[65vh] object-contain rounded-lg"
                      />

                    </div>

                  )}

                  {previewFile.mime_type ===
                    "application/pdf" && (

                    <iframe
                      src={previewFile.url}
                      title={previewFile.name}
                      className="w-full h-[65vh] rounded-lg border border-slate-200 bg-white"
                    />
                  )}

                  {previewFile.mime_type ===
                    "text/plain" && (

                    <TextPreview
                      url={previewFile.url}
                    />
                  )}

                  {!previewFile.mime_type?.startsWith(
                    "image/"
                  ) &&
                    previewFile.mime_type !==
                      "application/pdf" &&
                    previewFile.mime_type !==
                      "text/plain" && (

                    <div className="min-h-[300px] flex flex-col items-center justify-center">

                      <div className="text-5xl mb-4">
                        📄
                      </div>

                      <p className="text-slate-700 font-medium">
                        Preview not available
                      </p>

                      <a
                        href={previewFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                      >
                        Open File
                      </a>

                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* RECENT */}

          {activeSection === "recent" && (

            <div className="p-4 sm:p-6 lg:p-8 min-w-0">

              <div className="mb-7">

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Recent
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Your recently modified files
                </p>

              </div>

              {recentQuery.isLoading && (

                <div className="bg-white border border-slate-200 rounded-2xl min-h-[300px] flex items-center justify-center">

                  <p className="text-slate-500">
                    Loading recent files...
                  </p>

                </div>

              )}

              {recentQuery.isError && (

                <div className="bg-white border border-red-200 rounded-2xl min-h-[300px] flex items-center justify-center p-5">

                  <p className="text-red-500 text-center">
                    {recentQuery.error?.message ||
                      "Failed to load recent files"}
                  </p>

                </div>

              )}

              {!recentQuery.isLoading &&
                !recentQuery.isError && (

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

                  {recentQuery.data?.files?.length > 0 ? (

                    <div className="overflow-x-auto">

                      <div className="min-w-[560px]">

                        <div className="grid grid-cols-[minmax(0,1fr)_140px_80px] gap-3 px-4 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-400">

                          <div>
                            Name
                          </div>

                          <div>
                            Modified
                          </div>

                          <div>
                            Size
                          </div>

                        </div>

                        {recentQuery.data.files.map(
                          (file) => (

                            <button
                              key={file.id}
                              type="button"
                              onClick={() =>
                                setSelectedFile(file)
                              }
                              className="w-full grid grid-cols-[minmax(0,1fr)_140px_80px] gap-3 items-center px-4 sm:px-6 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition text-left"
                            >

                              <div className="flex items-center gap-3 min-w-0">

                                {file.mime_type?.startsWith(
                                  "image/"
                                ) ? (

                                  <img
                                    src={file.url}
                                    alt={file.name}
                                    loading="lazy"
                                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                                  />

                                ) : file.mime_type ===
                                  "application/pdf" ? (

                                  <span className="text-2xl shrink-0">
                                    📕
                                  </span>

                                ) : file.mime_type ===
                                  "text/plain" ? (

                                  <span className="text-2xl shrink-0">
                                    📄
                                  </span>

                                ) : (

                                  <span className="text-2xl shrink-0">
                                    📄
                                  </span>

                                )}

                                <span className="font-medium text-slate-800 truncate min-w-0">
                                  {file.name}
                                </span>

                              </div>

                              <div className="text-sm text-slate-500 truncate">

                                {file.updated_at
                                  ? new Date(
                                      file.updated_at
                                    ).toLocaleString()
                                  : "—"}

                              </div>

                              <div className="text-sm text-slate-500 truncate">

                                {file.size_bytes
                                  ? `${(
                                      file.size_bytes /
                                      1024 /
                                      1024
                                    ).toFixed(2)} MB`
                                  : "—"}

                              </div>

                            </button>

                          )
                        )}

                      </div>

                    </div>

                  ) : (

                    <div className="py-20 text-center px-5">

                      <div className="text-5xl mb-4">
                        ◷
                      </div>

                      <p className="text-slate-500">
                        No recent files
                      </p>

                      <p className="text-sm text-slate-400 mt-1">
                        Recently modified files will appear here.
                      </p>

                    </div>

                  )}

                </div>
              )}

            </div>
          )}

          {/* PREVIEW */}

          <PreviewModal
            selectedFile={selectedFile}
            onClose={() =>
              setSelectedFile(null)
            }
          />

          {/* TRASH */}

          {activeSection === "trash" && (

            <div className="p-4 sm:p-6 lg:p-8 min-w-0">

              <div className="mb-7">

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Trash
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Deleted files and folders
                </p>

              </div>

              {trashQuery.isLoading && (

                <div className="bg-white border border-slate-200 rounded-2xl min-h-[300px] flex items-center justify-center">

                  <p className="text-slate-500">
                    Loading trash...
                  </p>

                </div>

              )}

              {trashQuery.isError && (

                <div className="bg-white border border-red-200 rounded-2xl min-h-[300px] flex items-center justify-center p-5">

                  <p className="text-red-500 text-center">
                    {trashQuery.error?.message ||
                      "Failed to load trash"}
                  </p>

                </div>

              )}

              {!trashQuery.isLoading &&
                !trashQuery.isError && (

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

                  {trashQuery.data?.trash?.length > 0 ? (

                    <div className="overflow-x-auto">

                      <div className="min-w-[520px]">

                        <div className="grid grid-cols-[minmax(0,1fr)_80px_100px] px-4 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-400">

                          <div>
                            Name
                          </div>

                          <div>
                            Type
                          </div>

                          <div>
                            Action
                          </div>

                        </div>

                        {trashQuery.data.trash.map(
                          (item) => (

                            <div
                              key={`${item.resource_type}-${item.id}`}
                              className="grid grid-cols-[minmax(0,1fr)_80px_100px] items-center px-4 sm:px-6 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition"
                            >

                              <div className="flex items-center gap-3 min-w-0">

                                <div className="w-10 h-10 shrink-0 rounded-xl bg-red-50 flex items-center justify-center text-xl">
                                  {item.resource_type ===
                                  "folder"
                                    ? "📁"
                                    : "📄"}
                                </div>

                                <span className="font-medium text-slate-800 truncate min-w-0">
                                  {item.name}
                                </span>

                              </div>

                              <div className="text-sm text-slate-500 truncate">
                                {item.resource_type ===
                                "folder"
                                  ? "Folder"
                                  : "File"}
                              </div>

                              <button
                                type="button"
                                onClick={async () => {

                                  try {

                                    const token =
                                      localStorage.getItem(
                                        "accessToken"
                                      );

                                    const response =
                                      await fetch(
                                        `${process.env.NEXT_PUBLIC_API_URL}/api/trash/restore`,
                                        {
                                          method:
                                            "POST",
                                          headers: {
                                            "Content-Type":
                                              "application/json",
                                            Authorization: `Bearer ${token}`,
                                          },
                                          body: JSON.stringify(
                                            {
                                              resourceType:
                                                item.resource_type,
                                              resourceId:
                                                item.id,
                                            }
                                          ),
                                        }
                                      );

                                    const data =
                                      await response.json();

                                    if (
                                      !response.ok
                                    ) {
                                      throw new Error(
                                        data.message ||
                                          "Failed to restore"
                                      );
                                    }

                                    await queryClient.invalidateQueries(
                                      {
                                        queryKey: [
                                          "trash-items",
                                        ],
                                      }
                                    );

                                    await queryClient.invalidateQueries(
                                      {
                                        queryKey: [
                                          "root-folders",
                                        ],
                                      }
                                    );

                                  } catch (
                                    error
                                  ) {

                                    alert(
                                      error.message ||
                                        "Failed to restore resource"
                                    );

                                  }

                                }}
                                className="w-fit px-3 sm:px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium transition"
                              >
                                Restore
                              </button>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  ) : (

                    <div className="py-20 text-center px-5">

                      <div className="text-5xl mb-4">
                        🗑️
                      </div>

                      <p className="text-slate-500">
                        Trash is empty.
                      </p>

                      <p className="text-sm text-slate-400 mt-1">
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

      {/* PREVIEW MODAL */}

      <PreviewModal
        selectedFile={selectedFile}
        onClose={closePreview}
      />

      {/* ACCOUNT MODAL */}

      {showAccountModal && (

        <div
          className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-6"
          onClick={() =>
            setShowAccountModal(false)
          }
        >

          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-5 border-b border-slate-100">

              <div className="min-w-0">

                <h2 className="text-lg font-semibold text-slate-900">
                  Account
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Your Cloud Media account
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAccountModal(false)
                }
                className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
              >
                ✕
              </button>

            </div>

            {/* BODY */}

            <div className="p-4 sm:p-6">

              <div className="flex items-center gap-4">

                <div className="w-16 h-16 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-semibold shadow-sm">
                  {avatarLetter}
                </div>

                <div className="min-w-0">

                  <h3 className="font-semibold text-slate-900 truncate">
                    {userEmail || "User"}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Cloud Media user
                  </p>

                </div>

              </div>

              <div className="mt-6 rounded-xl bg-slate-50 border border-slate-100 p-4">

                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Email
                </p>

                <p className="text-sm font-medium text-slate-700 mt-2 break-all">
                  {userEmail ||
                    "Email not available"}
                </p>

              </div>

              <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-4">

                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Account status
                </p>

                <div className="flex items-center gap-2 mt-2">

                  <span className="w-2 h-2 rounded-full bg-green-500" />

                  <span className="text-sm font-medium text-slate-700">
                    Signed in
                  </span>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAccountModal(false)
                }
                className="mt-5 w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-medium text-sm hover:bg-slate-200 transition"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 w-full py-3 rounded-xl bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition"
              >
                🚪 Logout
              </button>

            </div>
          </div>
        </div>
      )}

    </>
  );
}