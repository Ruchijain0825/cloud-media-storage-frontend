export default function FileListRow({
  file,
  onPreview,
  onShare,
  onStar,
  isStarred,
  starLoading,
  menuId,
  openMenuId,
  setOpenMenuId,
}) {
  return (
    <div className="grid grid-cols-[minmax(300px,1fr)_100px_160px_110px_100px] gap-4 items-center px-6 py-4 border-b hover:bg-gray-50 transition">
      <button type="button" onClick={() => onPreview(file)} className="flex items-center gap-3 min-w-0 text-left">
        {file.mime_type?.startsWith("image/") ? (
          <img src={file.url} alt={file.name} loading="lazy" className="w-9 h-9 rounded object-cover shrink-0" />
        ) : file.mime_type === "application/pdf" ? (
          <span className="text-2xl shrink-0">📕</span>
        ) : file.mime_type === "text/plain" ? (
          <span className="text-2xl shrink-0">📝</span>
        ) : (
          <span className="text-2xl shrink-0">📄</span>
        )}

        <span className="font-medium text-gray-800 truncate">{file.name}</span>
      </button>

      <div className="text-sm text-gray-600">me</div>

      <div className="text-sm text-gray-500">
        {file.updated_at
          ? new Date(file.updated_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—"}
      </div>

      <div className="text-sm text-gray-500">
        {file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : "—"}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={starLoading}
          onClick={(e) => {
            e.stopPropagation();
            onStar("file", file.id);
          }}
          title={isStarred ? "Unstar" : "Star"}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xl transition ${
            isStarred ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"
          }`}
        >
          {isStarred ? "★" : "☆"}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(openMenuId === menuId ? null : menuId);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
          >
            ⋮
          </button>

          {openMenuId === menuId && (
            <div className="absolute right-0 top-9 z-50 w-36 bg-white border rounded-lg shadow-lg py-1" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => onPreview(file)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                Preview
              </button>
              <button type="button" onClick={() => onShare(file)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                Share
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
