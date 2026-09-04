const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const getToken = () => localStorage.getItem("accessToken");

export const fetchRootFolders = async () => {
  const response = await fetch(`${API_URL}/folder/root`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch root folders");
  return data;
};

export const fetchFolderChildren = async (folderId) => {
  const response = await fetch(`${API_URL}/folder/${folderId}/children`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch folder contents");
  return data;
};

export const updateFolder = async (folderId, name) => {
  const response = await fetch(`${API_URL}/folder/${folderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ name }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update folder");
  return data;
};

export const moveFolder = async (folderId, parentId) => {
  const response = await fetch(`${API_URL}/folder/${folderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ parentId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to move folder");
  return data;
};

export const deleteFolder = async (folderId) => {
  const response = await fetch(`${API_URL}/folder/${folderId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to delete folder");
  return data;
};

export const fetchMoveFolders = async (parentId = null) => {
  const url =
    parentId === null
      ? `${API_URL}/folder/root`
      : `${API_URL}/folder/${parentId}/children`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load destination folders");
  }

  return parentId === null ? data.folders ?? [] : data.children?.folders ?? [];
};
