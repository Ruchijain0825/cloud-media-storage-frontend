const API_URL = "http://localhost:8080/api";

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
