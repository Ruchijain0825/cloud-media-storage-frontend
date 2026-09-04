const API_URL = "https://cloud-media-storage-backend.onrender.com/api";

export const createFileShare = async ({ resourceId, email, role }) => {
  const token = localStorage.getItem("accessToken");

  console.log("SHARE API URL:", `${API_URL}/shares`);
  console.log("SHARE TOKEN EXISTS:", !!token);
  console.log("SHARE DATA:", { resourceId, email, role });

  if (!token) {
    throw new Error("Login token not found");
  }

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

  console.log("SHARE RESPONSE STATUS:", response.status);

  const text = await response.text();

  console.log("SHARE RESPONSE:", text);

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      message: text || "Server returned an invalid response",
    };
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
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
