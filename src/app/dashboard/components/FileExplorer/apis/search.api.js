export const fetchSearchResults = async (query, page = 1, limit = 10) => {
  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Search failed");
  }

  return data;
};