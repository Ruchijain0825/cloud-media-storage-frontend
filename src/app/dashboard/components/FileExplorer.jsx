"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";


const fetchRootFolders = async () => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch("http://localhost:8080/api/folder/root", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch root folders");
  }

  return data;
};


const fetchFolderChildren = async (folderId) => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(
    `http://localhost:8080/api/folder/${folderId}/children`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch folder contents");
  }

  return data;
};



const updateFolder = async (folderId, name) => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`http://localhost:8080/api/folder/${folderId}`, {
    method: "PATCH",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      name,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update folder");
  }

  return data;
};



const deleteFolder = async (folderId) => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`http://localhost:8080/api/folder/${folderId}`, {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete folder");
  }

  return data;
};


export default function FileExplorer({ currentFolderId, setCurrentFolderId }) {
  const queryClient = useQueryClient();



  const [folderPath, setFolderPath] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);


  const [editingFolderId, setEditingFolderId] = useState(null);

  const [editingFolderName, setEditingFolderName] = useState("");


  const [openMenuId, setOpenMenuId] = useState(null);


  const inputRef = useRef(null);



  const rootQuery = useQuery({
    queryKey: ["root-folders"],

    queryFn: fetchRootFolders,

    enabled: currentFolderId === null,
  });



  const childrenQuery = useQuery({
    queryKey: ["folder-children", currentFolderId],

    queryFn: () => fetchFolderChildren(currentFolderId),

    enabled: currentFolderId !== null,
  });


  const isLoading = rootQuery.isLoading || childrenQuery.isLoading;


  const isError = rootQuery.isError || childrenQuery.isError;

  const error = rootQuery.error || childrenQuery.error;


  useEffect(() => {
    if (editingFolderId !== null) {
      inputRef.current?.focus();

      inputRef.current?.select();
    }
  }, [editingFolderId]);

  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border min-h-[350px] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }


  if (isError) {
    return (
      <div className="bg-white rounded-xl border min-h-[350px] flex items-center justify-center">
        <p className="text-red-500">
          {error?.message || "Something went wrong"}
        </p>
      </div>
    );
  }


  const folders =
    currentFolderId === null
      ? (rootQuery.data?.folders ?? [])
      : (childrenQuery.data?.children?.folders ?? []);

  const files =
    currentFolderId === null
      ? (rootQuery.data?.files ?? [])
      : (childrenQuery.data?.children?.files ?? []);

  const handleOpenFolder = (folder) => {
    setCurrentFolderId(folder.id);

    setFolderPath((prev) => [
      ...prev,
      {
        id: folder.id,
        name: folder.name,
      },
    ]);

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
    const newName = editingFolderName.trim();

    if (!newName) {
      return;
    }

    try {
      await updateFolder(folderId, newName);

     
      await queryClient.invalidateQueries({
        queryKey: ["root-folders"],
      });

   
      await queryClient.invalidateQueries({
        queryKey: ["folder-children", currentFolderId],
      });

   
      setFolderPath((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? {
                ...folder,
                name: newName,
              }
            : folder,
        ),
      );

     
      setEditingFolderId(null);

      setEditingFolderName("");
    } catch (error) {
      console.error("Update folder error:", error);

      alert(error.message);
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



  const handleDeleteFolder = async (folderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this folder?",
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
        queryKey: ["folder-children", currentFolderId],
      });

      setOpenMenuId(null);
    } catch (error) {
      console.error("Delete folder error:", error);

      alert(error.message);
    }
  };

 

  const handleGoToRoot = () => {
    setCurrentFolderId(null);

    setFolderPath([]);

    setOpenMenuId(null);
  };



  return (
    <>
      <div className="bg-white rounded-xl border overflow-visible">
      

        <div className="px-5 pt-5">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <button
              type="button"
              onClick={handleGoToRoot}
              className="text-blue-600 hover:underline"
            >
              My Drive
            </button>

            {folderPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center gap-2">
                <span className="text-gray-400">/</span>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentFolderId(folder.id);

                    setFolderPath(folderPath.slice(0, index + 1));

                    setOpenMenuId(null);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  {folder.name}
                </button>
              </div>
            ))}
          </div>



          {currentFolderId !== null && (
            <button
              type="button"
              onClick={handleGoToRoot}
              className="mt-4 text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to My Drive
            </button>
          )}
        </div>


        {folders.length > 0 || files.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[760px]">
            
              <div className="grid grid-cols-[minmax(260px,2fr)_120px_180px_120px_50px] items-center px-5 py-3 border-y border-gray-200 bg-gray-50 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-1">
                  Name
                  <span className="text-gray-400">↑</span>
                </div>

                <div>Owner</div>

                <div>Last modified</div>

                <div>File size</div>

                <div></div>
              </div>

              {folders.map((folder) => {
                const menuId = `folder-${folder.id}`;

                const isEditing = editingFolderId === folder.id;

                return (
                  <div
                    key={folder.id}
                    className="group relative grid grid-cols-[minmax(260px,2fr)_120px_180px_120px_50px] items-center px-5 py-3 border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editingFolderName}
                        onChange={(event) =>
                          setEditingFolderName(event.target.value)
                        }
                        onKeyDown={(event) =>
                          handleFolderKeyDown(event, folder.id)
                        }
                        onBlur={cancelRename}
                        className="w-full max-w-md border border-blue-500 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenFolder(folder)}
                        className="flex items-center gap-3 min-w-0 text-left"
                      >
                        <span className="text-2xl shrink-0">📁</span>

                        <span className="text-sm font-medium text-gray-800 truncate">
                          {folder.name}
                        </span>
                      </button>
                    )}

                 

                    <div className="text-sm text-gray-600">me</div>

                

                    <div className="text-sm text-gray-500">
                      {folder.updated_at
                        ? new Date(folder.updated_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </div>

                 

                    <div className="text-sm text-gray-500">—</div>

                 

                    <div className="relative flex justify-center">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();

                          setOpenMenuId(openMenuId === menuId ? null : menuId);
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition"
                      >
                        ⋮
                      </button>

                      {openMenuId === menuId && (
                        <div
                          className="absolute right-0 top-9 z-50 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleEditFolder(folder)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Rename
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteFolder(folder.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            
              {files.map((file) => {
                const menuId = `file-${file.id}`;

                return (
                  <div
                    key={file.id}
                    className="group relative grid grid-cols-[minmax(260px,2fr)_120px_180px_120px_50px] items-center px-5 py-3 border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                 

                    <button
                      type="button"
                      onClick={() => setSelectedFile(file)}
                      className="flex items-center gap-3 min-w-0 text-left"
                    >
                      {/* FILE ICON */}

                      {file.mime_type?.startsWith("image/") ? (
                        <div className="w-8 h-8 rounded overflow-hidden shrink-0">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : file.mime_type === "application/pdf" ? (
                        <span className="text-2xl shrink-0">📕</span>
                      ) : file.mime_type === "text/plain" ? (
                        <span className="text-2xl shrink-0">📝</span>
                      ) : (
                        <span className="text-2xl shrink-0">📄</span>
                      )}

                      <span className="text-sm font-medium text-gray-800 truncate">
                        {file.name}
                      </span>
                    </button>

                 

                    <div className="text-sm text-gray-600">me</div>

                 

                    <div className="text-sm text-gray-500">
                      {file.updated_at
                        ? new Date(file.updated_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </div>

                  

                    <div className="text-sm text-gray-500">
                      {file.size
                        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                        : "—"}
                    </div>

                   

                    <div className="relative flex justify-center">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();

                          setOpenMenuId(openMenuId === menuId ? null : menuId);
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition"
                      >
                        ⋮
                      </button>

                      {openMenuId === menuId && (
                        <div
                          className="absolute right-0 top-9 z-50 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(file);

                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Preview
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
         
          <div className="py-20 text-center">
            <div className="text-5xl mb-4">📁</div>

            <p className="text-gray-500">This folder is empty.</p>
          </div>
        )}
      </div>


      {selectedFile && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6"
          onClick={() => setSelectedFile(null)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="min-w-0">
                <h2 className="font-semibold text-gray-800 truncate">
                  {selectedFile.name}
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {selectedFile.mime_type}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="ml-4 text-gray-500 hover:text-gray-900 text-xl"
              >
                ✕
              </button>
            </div>

           

            <div className="p-5 max-h-[75vh] overflow-auto flex justify-center">
            

              {selectedFile.mime_type?.startsWith("image/") && (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              )}

          

              {selectedFile.mime_type === "application/pdf" && (
                <iframe
                  src={selectedFile.url}
                  title={selectedFile.name}
                  className="w-full h-[70vh] rounded-lg border"
                />
              )}

           
              {selectedFile.mime_type === "text/plain" && (
                <TextPreview url={selectedFile.url} />
              )}

           

              {!selectedFile.mime_type?.startsWith("image/") &&
                selectedFile.mime_type !== "application/pdf" &&
                selectedFile.mime_type !== "text/plain" && (
                  <div className="py-20 text-center">
                    <div className="text-6xl mb-4">📄</div>

                    <p className="text-gray-600">
                      Preview not available for this file type.
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


function TextPreview({ url }) {
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
    return <div className="py-20 text-gray-500">Loading preview...</div>;
  }

  if (error) {
    return <div className="py-20 text-red-500">{error}</div>;
  }

  return (
    <pre className="w-full max-w-4xl whitespace-pre-wrap break-words bg-gray-50 rounded-lg p-5 text-sm text-gray-700">
      {content}
    </pre>
  );
}
