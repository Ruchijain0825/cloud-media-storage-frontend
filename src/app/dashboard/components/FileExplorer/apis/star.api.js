const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export const toggleStar = async (resourceType, resourceId, isStarred) => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/stars`, {
    method: isStarred ? "DELETE" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ resourceType, resourceId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update star");
  }

  return data;
};
