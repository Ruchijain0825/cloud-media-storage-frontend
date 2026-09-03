export const fetchRecentFiles = async () => {
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
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch recent files");
  }

  return data;
};