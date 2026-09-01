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
import { createFileShare, createPublicLink } from "./apis/share.api";

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

  const inputRef = useRef(null);

  const rootQuery = useQuery({
    queryKey: ["root-folders"],
    queryFn: fetchRootFolders,
    enabled: currentFolderId == null,
    staleTime: 30 * 1000,
  });

  const childrenQuery = useQuery({
    queryKey: ["folder-children", currentFolderId],
    queryFn: () => fetchFolderChildren(currentFolderId),
    enabled: currentFolderId != null,
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (editingFolderId !== null) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingFolderId]);

  if (rootQuery.isLoading || childrenQuery.isLoading) {
    return (
      <div className="bg-white border rounded-xl min-h-[300px] flex items-center justify-center">
        <p className="text-gray-500">Loading files...</p>
      </div>
    );
  }

  if (rootQuery.isError || childrenQuery.isError) {
    const error = rootQuery.error || childrenQuery.error;
    return (
      <div className="bg-white border rounded-xl min-h-[300px] flex items-center justify-center">
        <p className="text-red-500">{error?.message || "Something went wrong"}</p>
      </div>
    );
  }

  const folders =
    currentFolderId == null
      ? rootQuery.data?.folders ?? []
      : childrenQuery.data?.children?.folders ?? [];

  const files =
    currentFolderId == null
      ? rootQuery.data?.files ?? []
      : childrenQuery.data?.children?.files ?? [];

  const query = searchQuery.trim().toLowerCase();

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(query)
  );

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(query)
  );

  const sortedFolders = [...filteredFolders].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "date") {
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    }
    return 0;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "size") return (b.size || 0) - (a.size || 0);
    if (sortBy === "date") {
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    }
    return 0;
  });

  const handleOpenFolder = (folder) => {
    setCurrentFolderId(folder.id);
    setFolderPath((previous) => [...previous, { id: folder.id, name: folder.name }]);
    setOpenMenuId(null);
  };

  const handleGoToRoot = () => {
    setCurrentFolderId(null);
    setFolderPath([]);
    setOpenMenuId(null);
  };

  const handleBreadcrumbClick = (folder, index) => {
    setCurrentFolderId(folder.id);
    setFolderPath(folderPath.slice(0, index + 1));
    setOpenMenuId(null);
  };

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
    const validation = folderSchema.safeParse({ name: editingFolderName });

    if (!validation.success) {
      alert(validation.error.issues[0].message);
      return;
    }

    const name = validation.data.name;

    const previousRootData = queryClient.getQueryData(["root-folders"]);
    const previousChildrenData = queryClient.getQueryData([
      "folder-children",
      currentFolderId,
    ]);

    queryClient.setQueryData(["root-folders"], (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        folders: oldData.folders?.map((folder) =>
          folder.id === folderId ? { ...folder, name } : folder
        ),
      };
    });

    queryClient.setQueryData(["folder-children", currentFolderId], (oldData) => {
      if (!oldData?.children) return oldData;
      return {
        ...oldData,
        children: {
          ...oldData.children,
          folders: oldData.children.folders?.map((folder) =>
            folder.id === folderId ? { ...folder, name } : folder
          ),
        },
      };
    });

    setFolderPath((previous) =>
      previous.map((folder) =>
        folder.id === folderId ? { ...folder, name } : folder
      )
    );

    setEditingFolderId(null);
    setEditingFolderName("");

    try {
      await updateFolder(folderId, name);
    } catch (error) {
      console.error("Rename folder error:", error);

      queryClient.setQueryData(["root-folders"], previousRootData);
      queryClient.setQueryData(
        ["folder-children", currentFolderId],
        previousChildrenData
      );

      setFolderPath((previous) =>
        previous.map((folder) => {
          const oldRootFolder = previousRootData?.folders?.find(
            (item) => item.id === folder.id
          );
          const oldChildFolder = previousChildrenData?.children?.folders?.find(
            (item) => item.id === folder.id
          );
          const oldFolder = oldRootFolder || oldChildFolder;
          return oldFolder ? { ...folder, name: oldFolder.name } : folder;
        })
      );

      alert(error.message || "Failed to update folder");
    }
  };

  const handleFolderKeyDown = async (event, folderId) => {
    if (event.key === "Enter") {
      event.preventDefault();
      await handleUpdateFolder(folderId);
    }

    if (event.key === "Escape") {
      cancelRename();
    }
  };

  const openMoveModal = async (folder) => {
    setMovingFolder(folder);
    setMoveDestinationId(null);
    setMoveDestinationPath([]);
    setMoveError("");
    setOpenMenuId(null);
    setIsMoveLoading(true);

    try {
      const folders = await fetchMoveFolders(null);
      setMoveFolders(folders.filter((item) => item.id !== folder.id));
    } catch (error) {
      console.error("Load move folders error:", error);
      setMoveError(error.message);
    } finally {
      setIsMoveLoading(false);
    }
  };

  const handleMoveDestination = async (folder) => {
    if (!movingFolder || folder.id === movingFolder.id) return;

    setIsMoveLoading(true);
    setMoveError("");

    try {
      const children = await fetchMoveFolders(folder.id);

      setMoveFolders(
        children.filter((item) => item.id !== movingFolder.id)
      );

      setMoveDestinationId(folder.id);
      setMoveDestinationPath((previous) => [
        ...previous,
        { id: folder.id, name: folder.name },
      ]);
    } catch (error) {
      console.error("Load destination folders error:", error);
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
      const folders = await fetchMoveFolders(null);
      setMoveFolders(folders.filter((item) => item.id !== movingFolder?.id));
    } catch (error) {
      setMoveError(error.message);
    } finally {
      setIsMoveLoading(false);
    }
  };

  const handleMoveBack = async () => {
    if (moveDestinationPath.length === 0) return;

    const previousPath = [...moveDestinationPath];
    previousPath.pop();

    const parentId =
      previousPath.length > 0
        ? previousPath[previousPath.length - 1].id
        : null;

    setMoveDestinationPath(previousPath);
    setMoveDestinationId(parentId);
    setMoveError("");
    setIsMoveLoading(true);

    try {
      const folders = await fetchMoveFolders(parentId);
      setMoveFolders(
        folders.filter((item) => item.id !== movingFolder?.id)
      );
    } catch (error) {
      console.error("Load move folders error:", error);
      setMoveError(error.message);
    } finally {
      setIsMoveLoading(false);
    }
  };

  const handleMovePathClick = async (index) => {
    const newPath = moveDestinationPath.slice(0, index + 1);
    const parentId = newPath[newPath.length - 1].id;

    setMoveDestinationPath(newPath);
    setMoveDestinationId(parentId);
    setMoveError("");
    setIsMoveLoading(true);

    try {
      const folders = await fetchMoveFolders(parentId);
      setMoveFolders(
        folders.filter((item) => item.id !== movingFolder?.id)
      );
    } catch (error) {
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
    if (!movingFolder || !moveDestinationId || isMoving) return;

    const sourceFolderId = movingFolder.id;
    const destinationId = moveDestinationId;

    const previousRootData = queryClient.getQueryData(["root-folders"]);
    const previousCurrentChildrenData = queryClient.getQueryData([
      "folder-children",
      currentFolderId,
    ]);
    const previousDestinationData = queryClient.getQueryData([
      "folder-children",
      destinationId,
    ]);

    queryClient.setQueryData(["root-folders"], (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        folders: oldData.folders?.filter(
          (folder) => folder.id !== sourceFolderId
        ),
      };
    });

    queryClient.setQueryData(["folder-children", currentFolderId], (oldData) => {
      if (!oldData?.children) return oldData;
      return {
        ...oldData,
        children: {
          ...oldData.children,
          folders: oldData.children.folders?.filter(
            (folder) => folder.id !== sourceFolderId
          ),
        },
      };
    });

    queryClient.setQueryData(["folder-children", destinationId], (oldData) => {
      if (!oldData?.children) return oldData;

      const alreadyExists = oldData.children.folders?.some(
        (folder) => folder.id === sourceFolderId
      );

      if (alreadyExists) return oldData;

      return {
        ...oldData,
        children: {
          ...oldData.children,
          folders: [
            ...(oldData.children.folders ?? []),
            { ...movingFolder, parent_id: destinationId },
          ],
        },
      };
    });

    setIsMoving(true);
    setMoveError("");

    try {
      await moveFolder(sourceFolderId, destinationId);
      closeMoveModal();
    } catch (error) {
      console.error("Move folder error:", error);

      queryClient.setQueryData(["root-folders"], previousRootData);
      queryClient.setQueryData(
        ["folder-children", currentFolderId],
        previousCurrentChildrenData
      );
      queryClient.setQueryData(
        ["folder-children", destinationId],
        previousDestinationData
      );

      setMoveError(error.message || "Failed to move folder");
    } finally {
      setIsMoving(false);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this folder?"
    );

    if (!confirmed) return;

    try {
      await deleteFolder(folderId);

      await queryClient.invalidateQueries({ queryKey: ["root-folders"] });
      await queryClient.invalidateQueries({
        queryKey: ["folder-children", currentFolderId],
      });

      setOpenMenuId(null);
    } catch (error) {
      console.error("Delete folder error:", error);
      alert(error.message);
    }
  };

  const handleToggleStar = async (resourceType, resourceId) => {
    const key = `${resourceType}-${resourceId}`;

    try {
      setStarLoadingId(key);

      const isStarred = Boolean(starredItems[key]);

      await toggleStar(resourceType, resourceId, isStarred);

      setStarredItems((previous) => ({
        ...previous,
        [key]: !isStarred,
      }));
    } catch (error) {
      console.error("Star error:", error);
      alert(error.message);
    } finally {
      setStarLoadingId(null);
    }
  };

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
      setShareError("Email address is required");
      return;
    }

    if (!shareFile) return;

    try {
      setIsSharing(true);
      setShareError("");

      await createFileShare({
        resourceId: shareFile.id,
        email,
        role: shareRole,
      });

      alert("File shared successfully!");

      closeShareModal();
    } catch (error) {
      console.error("Share file error:", error);
      setShareError(error.message);
    } finally {
      setIsSharing(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!shareFile) return;

    try {
      setShareError("");

      const data = await createPublicLink(shareFile.id);
      const link = `${window.location.origin}/share/${data.linkShare.token}`;

      setPublicLink(link);
    } catch (error) {
      console.error("Generate link error:", error);
      setShareError(error.message);
    }
  };

  return (
    <>
      <div className="bg-white border rounded-xl overflow-visible">
        <Breadcrumb
          currentFolderId={currentFolderId}
          folderPath={folderPath}
          onRoot={handleGoToRoot}
          onBreadcrumb={handleBreadcrumbClick}
        />

        {sortedFolders.length > 0 || sortedFiles.length > 0 ? (
          viewMode === "grid" ? (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedFolders.map((folder) => {
                  const starKey = `folder-${folder.id}`;
                  const menuId = `grid-folder-menu-${folder.id}`;

                  return (
                    <FolderGridCard
                      key={folder.id}
                      folder={folder}
                      isEditing={editingFolderId === folder.id}
                      editingFolderName={editingFolderName}
                      inputRef={inputRef}
                      onEditingNameChange={setEditingFolderName}
                      onKeyDown={handleFolderKeyDown}
                      onOpen={handleOpenFolder}
                      onStar={handleToggleStar}
                      isStarred={Boolean(starredItems[starKey])}
                      starLoading={starLoadingId === starKey}
                      menuId={menuId}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      onRename={handleEditFolder}
                      onMove={openMoveModal}
                      onDelete={handleDeleteFolder}
                    />
                  );
                })}

                {sortedFiles.map((file) => {
                  const starKey = `file-${file.id}`;
                  const menuId = `grid-file-menu-${file.id}`;

                  return (
                    <FileGridCard
                      key={file.id}
                      file={file}
                      onPreview={(item) => {
                        setSelectedFile(item);
                        setOpenMenuId(null);
                      }}
                      onShare={openShareModal}
                      onStar={handleToggleStar}
                      isStarred={Boolean(starredItems[starKey])}
                      starLoading={starLoadingId === starKey}
                      menuId={menuId}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[minmax(300px,1fr)_100px_160px_110px_100px] gap-4 items-center px-6 py-3 bg-gray-50 border-y text-xs font-medium text-gray-500">
                  <div>Name</div>
                  <div>Owner</div>
                  <div>Last modified</div>
                  <div>File size</div>
                  <div>Actions</div>
                </div>

                {sortedFolders.map((folder) => {
                  const starKey = `folder-${folder.id}`;
                  const menuId = `folder-menu-${folder.id}`;

                  return (
                    <FolderListRow
                      key={folder.id}
                      folder={folder}
                      isEditing={editingFolderId === folder.id}
                      editingFolderName={editingFolderName}
                      inputRef={inputRef}
                      onEditingNameChange={setEditingFolderName}
                      onKeyDown={handleFolderKeyDown}
                      onOpen={handleOpenFolder}
                      onStar={handleToggleStar}
                      isStarred={Boolean(starredItems[starKey])}
                      starLoading={starLoadingId === starKey}
                      menuId={menuId}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      onRename={handleEditFolder}
                      onMove={openMoveModal}
                      onDelete={handleDeleteFolder}
                    />
                  );
                })}

                {sortedFiles.map((file) => {
                  const starKey = `file-${file.id}`;
                  const menuId = `file-menu-${file.id}`;

                  return (
                    <FileListRow
                      key={file.id}
                      file={file}
                      onPreview={(item) => {
                        setSelectedFile(item);
                        setOpenMenuId(null);
                      }}
                      onShare={openShareModal}
                      onStar={handleToggleStar}
                      isStarred={Boolean(starredItems[starKey])}
                      starLoading={starLoadingId === starKey}
                      menuId={menuId}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                    />
                  );
                })}
              </div>
            </div>
          )
        ) : (
          <div className="py-20 text-center">
            <div className="text-5xl mb-4">📁</div>
            <p className="text-gray-500">
              {query ? "No matching files or folders." : "This folder is empty."}
            </p>
          </div>
        )}
      </div>

      <MoveModal
        movingFolder={movingFolder}
        moveDestinationPath={moveDestinationPath}
        moveFolders={moveFolders}
        moveError={moveError}
        isMoveLoading={isMoveLoading}
        isMoving={isMoving}
        onClose={closeMoveModal}
        onRoot={handleMoveRoot}
        onPathClick={handleMovePathClick}
        onBack={handleMoveBack}
        onDestination={handleMoveDestination}
        onMove={handleMoveFolder}
      />

      <PreviewModal
        selectedFile={selectedFile}
        onClose={() => setSelectedFile(null)}
      />

      <ShareModal
        shareFile={shareFile}
        shareEmail={shareEmail}
        shareRole={shareRole}
        shareError={shareError}
        publicLink={publicLink}
        isSharing={isSharing}
        setShareEmail={setShareEmail}
        setShareRole={setShareRole}
        onClose={closeShareModal}
        onShare={handleShareFile}
        onGenerateLink={handleGenerateLink}
      />
    </>
  );
}
