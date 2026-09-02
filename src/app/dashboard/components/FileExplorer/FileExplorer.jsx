"use client";

import { folderSchema } from "@/lib/validation/folder.schema";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchRootFolders,
  fetchFolderChildren,
  updateFolder,
  moveFolder,
  deleteFolder,
  fetchMoveFolders,
} from "./apis/folder.api";

import { toggleStar } from "./apis/star.api";

import {
  createFileShare,
  createPublicLink,
} from "./apis/share.api";

import { fetchSearchResults } from "./apis/search.api";

import Breadcrumb from "./components/Breadcrumb";
import FolderGridCard from "./components/FolderGridCard";
import FileGridCard from "./components/FileGridCard";
import FolderListRow from "./components/FolderListRow";
import FileListRow from "./components/FileListRow";
import MoveModal from "./components/MoveModal";
import PreviewModal from "./components/PreviewModal";
import ShareModal from "./components/ShareModal";

export default function FileExplorer({
  currentFolderId = null,
  setCurrentFolderId,
  searchQuery = "",
  sortBy = "name",
  viewMode = "list",
}) {
  const queryClient = useQueryClient();

  const [folderPath, setFolderPath] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [shareFile, setShareFile] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState("viewer");
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState("");
  const [publicLink, setPublicLink] = useState("");

  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState("");

  const [movingFolder, setMovingFolder] = useState(null);
  const [moveDestinationId, setMoveDestinationId] = useState(null);
  const [moveDestinationPath, setMoveDestinationPath] = useState([]);
  const [moveFolders, setMoveFolders] = useState([]);
  const [isMoveLoading, setIsMoveLoading] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [moveError, setMoveError] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);

  const [starredItems, setStarredItems] = useState({});
  const [starLoadingId, setStarLoadingId] = useState(null);

  const [searchPage, setSearchPage] = useState(1);

  const inputRef = useRef(null);

  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;

  // =========================================================
  // ROOT FOLDERS
  // =========================================================

  const rootQuery = useQuery({
    queryKey: ["root-folders"],
    queryFn: fetchRootFolders,
    enabled: currentFolderId == null && !isSearching,
    staleTime: 30 * 1000,
  });

  // =========================================================
  // FOLDER CHILDREN
  // =========================================================

  const childrenQuery = useQuery({
    queryKey: ["folder-children", currentFolderId],
    queryFn: () => fetchFolderChildren(currentFolderId),
    enabled: currentFolderId != null && !isSearching,
    staleTime: 30 * 1000,
  });

  // =========================================================
  // SEARCH
  // =========================================================

  const searchQueryResult = useQuery({
    queryKey: ["search", query, searchPage],
    queryFn: () => fetchSearchResults(query, searchPage, 10),
    enabled: isSearching,
    staleTime: 30 * 1000,
  });

  // =========================================================
  // RESET SEARCH PAGE
  // =========================================================

  useEffect(() => {
    setSearchPage(1);
  }, [searchQuery]);

  // =========================================================
  // FOCUS RENAME INPUT
  // =========================================================

  useEffect(() => {
    if (editingFolderId !== null) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingFolderId]);

  // =========================================================
  // LOADING
  // =========================================================

  if (
    rootQuery.isLoading ||
    childrenQuery.isLoading ||
    searchQueryResult.isLoading
  ) {
    return (
      <div className="bg-white rounded-2xl min-h-[300px] flex items-center justify-center">
        <p className="text-gray-500">Loading files...</p>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (
    rootQuery.isError ||
    childrenQuery.isError ||
    searchQueryResult.isError
  ) {
    const error =
      rootQuery.error ||
      childrenQuery.error ||
      searchQueryResult.error;

    return (
      <div className="bg-white rounded-2xl min-h-[300px] flex items-center justify-center">
        <p className="text-red-500">
          {error?.message || "Something went wrong"}
        </p>
      </div>
    );
  }

  // =========================================================
  // DATA
  // =========================================================

  const folders = isSearching
    ? (searchQueryResult.data?.data ?? []).filter(
        (item) => item.resource_type === "folder"
      )
    : currentFolderId == null
      ? rootQuery.data?.folders ?? []
      : childrenQuery.data?.children?.folders ?? [];

  const files = isSearching
    ? (searchQueryResult.data?.data ?? []).filter(
        (item) => item.resource_type === "file"
      )
    : currentFolderId == null
      ? rootQuery.data?.files ?? []
      : childrenQuery.data?.children?.files ?? [];

  // =========================================================
  // SORT FOLDERS
  // =========================================================

  const sortedFolders = [...folders].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }

    if (sortBy === "date") {
      return (
        new Date(b.updated_at || 0) -
        new Date(a.updated_at || 0)
      );
    }

    return 0;
  });

  // =========================================================
  // SORT FILES
  // =========================================================

  const sortedFiles = [...files].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }

    if (sortBy === "size") {
      const sizeA = a.size || a.size_bytes || 0;
      const sizeB = b.size || b.size_bytes || 0;

      return sizeB - sizeA;
    }

    if (sortBy === "date") {
      return (
        new Date(b.updated_at || 0) -
        new Date(a.updated_at || 0)
      );
    }

    return 0;
  });

  // =========================================================
  // OPEN FOLDER
  // =========================================================

  const handleOpenFolder = (folder) => {
    setCurrentFolderId(folder.id);

    setFolderPath((previous) => [
      ...previous,
      {
        id: folder.id,
        name: folder.name,
      },
    ]);

    setOpenMenuId(null);
  };

  // =========================================================
  // GO TO ROOT
  // =========================================================

  const handleGoToRoot = () => {
    setCurrentFolderId(null);
    setFolderPath([]);
    setOpenMenuId(null);
  };

  // =========================================================
  // BREADCRUMB
  // =========================================================

  const handleBreadcrumbClick = (folder, index) => {
    setCurrentFolderId(folder.id);
    setFolderPath(folderPath.slice(0, index + 1));
    setOpenMenuId(null);
  };

  // =========================================================
  // RENAME
  // =========================================================

  const handleEditFolder = (folder) => {
    setEditingFolderId(folder.id);
    setEditingFolderName(folder.name);
    setOpenMenuId(null);
  };

  const cancelRename = () => {
    setEditingFolderId(null);
    setEditingFolderName("");
  };

  const handleUpdateFolder = async (folderId) => {
    const validation = folderSchema.safeParse({
      name: editingFolderName,
    });

    if (!validation.success) {
      alert(validation.error.issues[0].message);
      return;
    }

    const name = validation.data.name;

    const previousRootData =
      queryClient.getQueryData(["root-folders"]);

    const previousChildrenData =
      queryClient.getQueryData([
        "folder-children",
        currentFolderId,
      ]);

    // OPTIMISTIC ROOT UPDATE

    queryClient.setQueryData(
      ["root-folders"],
      (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          folders: oldData.folders?.map((folder) =>
            folder.id === folderId
              ? {
                  ...folder,
                  name,
                }
              : folder
          ),
        };
      }
    );

    // OPTIMISTIC CHILD UPDATE

    queryClient.setQueryData(
      ["folder-children", currentFolderId],
      (oldData) => {
        if (!oldData?.children) return oldData;

        return {
          ...oldData,
          children: {
            ...oldData.children,
            folders:
              oldData.children.folders?.map(
                (folder) =>
                  folder.id === folderId
                    ? {
                        ...folder,
                        name,
                      }
                    : folder
              ),
          },
        };
      }
    );

    setFolderPath((previous) =>
      previous.map((folder) =>
        folder.id === folderId
          ? {
              ...folder,
              name,
            }
          : folder
      )
    );

    setEditingFolderId(null);
    setEditingFolderName("");

    try {
      await updateFolder(folderId, name);

      await queryClient.invalidateQueries({
        queryKey: ["search"],
      });
    } catch (error) {
      console.error(
        "Rename folder error:",
        error
      );

      queryClient.setQueryData(
        ["root-folders"],
        previousRootData
      );

      queryClient.setQueryData(
        ["folder-children", currentFolderId],
        previousChildrenData
      );

      alert(
        error.message ||
          "Failed to update folder"
      );
    }
  };

  const handleFolderKeyDown = async (
    event,
    folderId
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();

      await handleUpdateFolder(folderId);
    }

    if (event.key === "Escape") {
      cancelRename();
    }
  };

  // =========================================================
  // MOVE
  // =========================================================

  const openMoveModal = async (folder) => {
    setMovingFolder(folder);
    setMoveDestinationId(null);
    setMoveDestinationPath([]);
    setMoveError("");
    setOpenMenuId(null);
    setIsMoveLoading(true);

    try {
      const folders =
        await fetchMoveFolders(null);

      setMoveFolders(
        folders.filter(
          (item) => item.id !== folder.id
        )
      );
    } catch (error) {
      console.error(
        "Load move folders error:",
        error
      );

      setMoveError(error.message);
    } finally {
      setIsMoveLoading(false);
    }
  };

  const handleMoveDestination = async (
    folder
  ) => {
    if (
      !movingFolder ||
      folder.id === movingFolder.id
    ) {
      return;
    }

    setIsMoveLoading(true);
    setMoveError("");

    try {
      const children =
        await fetchMoveFolders(folder.id);

      setMoveFolders(
        children.filter(
          (item) =>
            item.id !== movingFolder.id
        )
      );

      setMoveDestinationId(folder.id);

      setMoveDestinationPath(
        (previous) => [
          ...previous,
          {
            id: folder.id,
            name: folder.name,
          },
        ]
      );
    } catch (error) {
      console.error(
        "Load destination folders error:",
        error
      );

      setMoveError(error.message);
    } finally {
      setIsMoveLoading(false);
    }
  };

  const handleMoveRoot = async () => {
    setMoveDestinationPath([]);
    setMoveDestinationId(null);
    setMoveError("");
    setIsMoveLoading(true);

    try {
      const folders =
        await fetchMoveFolders(null);

      setMoveFolders(
        folders.filter(
          (item) =>
            item.id !== movingFolder?.id
        )
      );
    } catch (error) {
      setMoveError(error.message);
    } finally {
      setIsMoveLoading(false);
    }
  };

  const handleMoveBack = async () => {
    if (moveDestinationPath.length === 0) {
      return;
    }

    const previousPath = [
      ...moveDestinationPath,
    ];

    previousPath.pop();

    const parentId =
      previousPath.length > 0
        ? previousPath[
            previousPath.length - 1
          ].id
        : null;

    setMoveDestinationPath(
      previousPath
    );

    setMoveDestinationId(parentId);
    setMoveError("");
    setIsMoveLoading(true);

    try {
      const folders =
        await fetchMoveFolders(parentId);

      setMoveFolders(
        folders.filter(
          (item) =>
            item.id !==
            movingFolder?.id
        )
      );
    } catch (error) {
      console.error(
        "Load move folders error:",
        error
      );

      setMoveError(error.message);
    } finally {
      setIsMoveLoading(false);
    }
  };

  const handleMovePathClick = async (
    index
  ) => {
    const newPath =
      moveDestinationPath.slice(
        0,
        index + 1
      );

    const parentId =
      newPath[newPath.length - 1].id;

    setMoveDestinationPath(newPath);
    setMoveDestinationId(parentId);
    setMoveError("");
    setIsMoveLoading(true);

    try {
      const folders =
        await fetchMoveFolders(parentId);

      setMoveFolders(
        folders.filter(
          (item) =>
            item.id !==
            movingFolder?.id
        )
      );
    } catch (error) {
      console.error(
        "Load move folders error:",
        error
      );

      setMoveError(error.message);
    } finally {
      setIsMoveLoading(false);
    }
  };

  const closeMoveModal = () => {
    if (isMoving) return;

    setMovingFolder(null);
    setMoveDestinationId(null);
    setMoveDestinationPath([]);
    setMoveFolders([]);
    setMoveError("");
    setIsMoveLoading(false);
  };

  const handleMoveFolder = async () => {
    if (
      !movingFolder ||
      !moveDestinationId ||
      isMoving
    ) {
      return;
    }

    const sourceFolderId =
      movingFolder.id;

    const destinationId =
      moveDestinationId;

    const previousRootData =
      queryClient.getQueryData([
        "root-folders",
      ]);

    const previousCurrentChildrenData =
      queryClient.getQueryData([
        "folder-children",
        currentFolderId,
      ]);

    const previousDestinationData =
      queryClient.getQueryData([
        "folder-children",
        destinationId,
      ]);

    // OPTIMISTIC ROOT

    queryClient.setQueryData(
      ["root-folders"],
      (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          folders:
            oldData.folders?.filter(
              (folder) =>
                folder.id !==
                sourceFolderId
            ),
        };
      }
    );

    // OPTIMISTIC CURRENT FOLDER

    queryClient.setQueryData(
      [
        "folder-children",
        currentFolderId,
      ],
      (oldData) => {
        if (!oldData?.children) {
          return oldData;
        }

        return {
          ...oldData,
          children: {
            ...oldData.children,
            folders:
              oldData.children.folders?.filter(
                (folder) =>
                  folder.id !==
                  sourceFolderId
              ),
          },
        };
      }
    );

    // OPTIMISTIC DESTINATION

    queryClient.setQueryData(
      [
        "folder-children",
        destinationId,
      ],
      (oldData) => {
        if (!oldData?.children) {
          return oldData;
        }

        const alreadyExists =
          oldData.children.folders?.some(
            (folder) =>
              folder.id ===
              sourceFolderId
          );

        if (alreadyExists) {
          return oldData;
        }

        return {
          ...oldData,
          children: {
            ...oldData.children,
            folders: [
              ...(oldData.children.folders ??
                []),
              {
                ...movingFolder,
                parent_id:
                  destinationId,
              },
            ],
          },
        };
      }
    );

    setIsMoving(true);
    setMoveError("");

    try {
      await moveFolder(
        sourceFolderId,
        destinationId
      );

      await queryClient.invalidateQueries({
        queryKey: ["search"],
      });

      closeMoveModal();
    } catch (error) {
      console.error(
        "Move folder error:",
        error
      );

      queryClient.setQueryData(
        ["root-folders"],
        previousRootData
      );

      queryClient.setQueryData(
        [
          "folder-children",
          currentFolderId,
        ],
        previousCurrentChildrenData
      );

      queryClient.setQueryData(
        [
          "folder-children",
          destinationId,
        ],
        previousDestinationData
      );

      setMoveError(
        error.message ||
          "Failed to move folder"
      );
    } finally {
      setIsMoving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDeleteFolder = async (
    folderId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this folder?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteFolder(folderId);

      await queryClient.invalidateQueries({
        queryKey: ["root-folders"],
      });

      await queryClient.invalidateQueries({
        queryKey: [
          "folder-children",
          currentFolderId,
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: ["search"],
      });

      setOpenMenuId(null);
    } catch (error) {
      console.error(
        "Delete folder error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete folder"
      );
    }
  };

  // =========================================================
  // STAR / UNSTAR
  // =========================================================

  const handleToggleStar = async (
    resourceType,
    resourceId
  ) => {
    const key = `${resourceType}-${resourceId}`;

    try {
      setStarLoadingId(key);

      const isStarred =
        Boolean(starredItems[key]);

      await toggleStar(
        resourceType,
        resourceId,
        isStarred
      );

      setStarredItems(
        (previous) => ({
          ...previous,
          [key]: !isStarred,
        })
      );

      await queryClient.invalidateQueries({
        queryKey: ["starred-items"],
      });
    } catch (error) {
      console.error(
        "Star error:",
        error
      );

      alert(
        error.message ||
          "Failed to update star"
      );
    } finally {
      setStarLoadingId(null);
    }
  };

  // =========================================================
  // SHARE
  // =========================================================

  const openShareModal = (file) => {
    setShareFile(file);
    setShareEmail("");
    setShareRole("viewer");
    setShareError("");
    setPublicLink("");
    setOpenMenuId(null);
  };

  const closeShareModal = () => {
    setShareFile(null);
    setShareEmail("");
    setShareRole("viewer");
    setShareError("");
    setPublicLink("");
  };

  const handleShareFile = async () => {
    const email = shareEmail.trim();

    if (!email) {
      setShareError(
        "Email address is required"
      );
      return;
    }

    if (!shareFile) {
      return;
    }

    try {
      setIsSharing(true);
      setShareError("");

      const data = await createFileShare({
        resourceId: shareFile.id,
        email,
        role: shareRole,
      });

      alert(
        data?.message ||
          "File shared successfully!"
      );

      closeShareModal();
    } catch (error) {
      console.error(
        "Share file error:",
        error
      );

      setShareError(
        error.message ||
          "Failed to share file"
      );
    } finally {
      setIsSharing(false);
    }
  };

  // =========================================================
  // PUBLIC LINK
  // =========================================================

  const handleGenerateLink = async () => {
    if (!shareFile) {
      return;
    }

    try {
      setShareError("");

      const data =
        await createPublicLink(
          shareFile.id
        );

      const link =
        `${window.location.origin}/share/${data.linkShare.token}`;

      setPublicLink(link);
    } catch (error) {
      console.error(
        "Generate link error:",
        error
      );

      setShareError(
        error.message ||
          "Failed to generate link"
      );
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      <div className="bg-white rounded-2xl overflow-visible">

        {/* ===================================================
            BREADCRUMB
        =================================================== */}

        {!isSearching && (
          <Breadcrumb
            currentFolderId={
              currentFolderId
            }
            folderPath={folderPath}
            onRoot={handleGoToRoot}
            onBreadcrumb={
              handleBreadcrumbClick
            }
          />
        )}

        {/* ===================================================
            SEARCH RESULT LABEL
        =================================================== */}

        {isSearching && (
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-sm text-slate-500">
              Search results for{" "}
              <span className="font-medium text-slate-800">
                "{searchQuery.trim()}"
              </span>
            </p>
          </div>
        )}

        {/* ===================================================
            DATA
        =================================================== */}

        {sortedFolders.length > 0 ||
        sortedFiles.length > 0 ? (
          viewMode === "grid" ? (

            /* =================================================
               GRID VIEW
            ================================================= */

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                {sortedFolders.map(
                  (folder) => {
                    const starKey =
                      `folder-${folder.id}`;

                    const menuId =
                      `grid-folder-menu-${folder.id}`;

                    return (
                      <FolderGridCard
                        key={folder.id}
                        folder={folder}
                        isEditing={
                          editingFolderId ===
                          folder.id
                        }
                        editingFolderName={
                          editingFolderName
                        }
                        inputRef={
                          inputRef
                        }
                        onEditingNameChange={
                          setEditingFolderName
                        }
                        onKeyDown={
                          handleFolderKeyDown
                        }
                        onOpen={
                          handleOpenFolder
                        }
                        onStar={
                          handleToggleStar
                        }
                        isStarred={Boolean(
                          starredItems[
                            starKey
                          ]
                        )}
                        starLoading={
                          starLoadingId ===
                          starKey
                        }
                        menuId={
                          menuId
                        }
                        openMenuId={
                          openMenuId
                        }
                        setOpenMenuId={
                          setOpenMenuId
                        }
                        onRename={
                          handleEditFolder
                        }
                        onMove={
                          openMoveModal
                        }
                        onDelete={
                          handleDeleteFolder
                        }
                      />
                    );
                  }
                )}

                {sortedFiles.map(
                  (file) => {
                    const starKey =
                      `file-${file.id}`;

                    const menuId =
                      `grid-file-menu-${file.id}`;

                    return (
                      <FileGridCard
                        key={file.id}
                        file={file}
                        onPreview={(
                          item
                        ) => {
                          setSelectedFile(
                            item
                          );

                          setOpenMenuId(
                            null
                          );
                        }}
                        onShare={
                          openShareModal
                        }
                        onStar={
                          handleToggleStar
                        }
                        isStarred={Boolean(
                          starredItems[
                            starKey
                          ]
                        )}
                        starLoading={
                          starLoadingId ===
                          starKey
                        }
                        menuId={
                          menuId
                        }
                        openMenuId={
                          openMenuId
                        }
                        setOpenMenuId={
                          setOpenMenuId
                        }
                      />
                    );
                  }
                )}

              </div>
            </div>

          ) : (

            /* =================================================
               LIST VIEW
            ================================================= */

            <div className="overflow-x-auto">
              <div className="min-w-[900px]">

                <div className="grid grid-cols-[minmax(300px,1fr)_100px_160px_110px_100px] gap-4 items-center px-6 py-3 bg-slate-50 border-y border-slate-100 text-xs font-medium text-slate-500">
                  <div>Name</div>
                  <div>Owner</div>
                  <div>Last modified</div>
                  <div>File size</div>
                  <div>Actions</div>
                </div>

                {sortedFolders.map(
                  (folder) => {
                    const starKey =
                      `folder-${folder.id}`;

                    const menuId =
                      `folder-menu-${folder.id}`;

                    return (
                      <FolderListRow
                        key={folder.id}
                        folder={folder}
                        isEditing={
                          editingFolderId ===
                          folder.id
                        }
                        editingFolderName={
                          editingFolderName
                        }
                        inputRef={
                          inputRef
                        }
                        onEditingNameChange={
                          setEditingFolderName
                        }
                        onKeyDown={
                          handleFolderKeyDown
                        }
                        onOpen={
                          handleOpenFolder
                        }
                        onStar={
                          handleToggleStar
                        }
                        isStarred={Boolean(
                          starredItems[
                            starKey
                          ]
                        )}
                        starLoading={
                          starLoadingId ===
                          starKey
                        }
                        menuId={
                          menuId
                        }
                        openMenuId={
                          openMenuId
                        }
                        setOpenMenuId={
                          setOpenMenuId
                        }
                        onRename={
                          handleEditFolder
                        }
                        onMove={
                          openMoveModal
                        }
                        onDelete={
                          handleDeleteFolder
                        }
                      />
                    );
                  }
                )}

                {sortedFiles.map(
                  (file) => {
                    const starKey =
                      `file-${file.id}`;

                    const menuId =
                      `file-menu-${file.id}`;

                    return (
                      <FileListRow
                        key={file.id}
                        file={file}
                        onPreview={(
                          item
                        ) => {
                          setSelectedFile(
                            item
                          );

                          setOpenMenuId(
                            null
                          );
                        }}
                        onShare={
                          openShareModal
                        }
                        onStar={
                          handleToggleStar
                        }
                        isStarred={Boolean(
                          starredItems[
                            starKey
                          ]
                        )}
                        starLoading={
                          starLoadingId ===
                          starKey
                        }
                        menuId={
                          menuId
                        }
                        openMenuId={
                          openMenuId
                        }
                        setOpenMenuId={
                          setOpenMenuId
                        }
                      />
                    );
                  }
                )}

              </div>
            </div>
          )
        ) : (

          /* =================================================
             EMPTY STATE
          ================================================= */

          <div className="py-20 text-center">
            <div className="text-5xl mb-4">
              📁
            </div>

            <p className="text-gray-500">
              {isSearching
                ? "No matching files or folders."
                : "This folder is empty."}
            </p>
          </div>
        )}

        {/* ===================================================
            SEARCH PAGINATION
        =================================================== */}

        {isSearching &&
          searchQueryResult.data
            ?.pagination && (
            <div className="flex items-center justify-center gap-4 py-4 border-t border-slate-100">

              <button
                type="button"
                onClick={() =>
                  setSearchPage(
                    (page) =>
                      page - 1
                  )
                }
                disabled={
                  searchPage === 1
                }
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>

              <span className="text-sm text-slate-600">
                Page {searchPage}
              </span>

              <button
                type="button"
                onClick={() =>
                  setSearchPage(
                    (page) =>
                      page + 1
                  )
                }
                disabled={
                  !searchQueryResult
                    .data
                    .pagination
                    .hasNextPage
                }
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>

            </div>
          )}

      </div>

      {/* =====================================================
          MOVE MODAL
      ===================================================== */}

      <MoveModal
        movingFolder={movingFolder}
        moveDestinationPath={
          moveDestinationPath
        }
        moveFolders={moveFolders}
        moveError={moveError}
        isMoveLoading={
          isMoveLoading
        }
        isMoving={isMoving}
        onClose={closeMoveModal}
        onRoot={handleMoveRoot}
        onPathClick={
          handleMovePathClick
        }
        onBack={handleMoveBack}
        onDestination={
          handleMoveDestination
        }
        onMove={handleMoveFolder}
      />

      {/* =====================================================
          PREVIEW MODAL
      ===================================================== */}

      <PreviewModal
        selectedFile={selectedFile}
        onClose={() =>
          setSelectedFile(null)
        }
      />

      {/* =====================================================
          SHARE MODAL
      ===================================================== */}

      <ShareModal
        shareFile={shareFile}
        shareEmail={shareEmail}
        shareRole={shareRole}
        shareError={shareError}
        publicLink={publicLink}
        isSharing={isSharing}
        setShareEmail={
          setShareEmail
        }
        setShareRole={
          setShareRole
        }
        onClose={
          closeShareModal
        }
        onShare={
          handleShareFile
        }
        onGenerateLink={
          handleGenerateLink
        }
      />
    </>
  );
}