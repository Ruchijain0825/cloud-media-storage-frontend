export default function FileGridCard({
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
    <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-white hover:bg-gray-50 hover:shadow-sm transition">
      <button type="button" onClick={() => onPreview(file)} className="w-full text-left">
        <div className="h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
          {file.mime_type?.startsWith("image/") ? (
            <img src={file.url} alt={file.name} loading="lazy" className="w-full h-full object-cover" />
          ) : file.mime_type === "application/pdf" ? (
            <span className="text-6xl">📕</span>
          ) : file.mime_type === "text/plain" ? (
            <span className="text-6xl">📝</span>
          ) : (
            <span className="text-6xl">📄</span>
          )}
        </div>
      </button>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={() => onPreview(file)} className="min-w-0 text-left flex-1">
            <p className="font-medium text-gray-800 truncate">{file.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              {file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : "—"}
            </p>
          </button>

          <div className="relative shrink-0">
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

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {file.updated_at
              ? new Date(file.updated_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "—"}
          </span>

          <button
            type="button"
            disabled={starLoading}
            onClick={(e) => {
              e.stopPropagation();
              onStar("file", file.id);
            }}
            title={isStarred ? "Unstar" : "Star"}
            className={`text-xl ${
              isStarred ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"
            }`}
          >
            {isStarred ? "★" : "☆"}
          </button>
        </div>
      </div>
    </div>
  );
}
