const API_URL = "https://cloud-media-storage-backend.onrender.com/api";
console.log("SHARE API URL:", `${API_URL}/shares`);
console.log("SHARE TOKEN EXISTS:", !!token);
export const createFileShare = async ({ resourceId, email, role }) => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/shares`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      resourceType: "file",
      resourceId,
      email,
      role,
    }),
  });
  console.log("SHARE STATUS:", response.status);
console.log("SHARE RESPONSE:", await response.clone().text());

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to share file");
  }

  return data;
};

export const createPublicLink = async (resourceId) => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/link-shares`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      resourceType: "file",
      resourceId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create public link");
  }

  return data;
};
