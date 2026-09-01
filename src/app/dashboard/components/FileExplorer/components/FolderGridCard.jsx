export default function FolderGridCard({
  folder,
  isEditing,
  editingFolderName,
  inputRef,
  onEditingNameChange,
  onKeyDown,
  onOpen,
  onStar,
  isStarred,
  starLoading,
  menuId,
  openMenuId,
  setOpenMenuId,
  onRename,
  onMove,
  onDelete,
}) {
  return (
    <div className="relative border border-gray-200 rounded-xl p-4 bg-white hover:bg-gray-50 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-3">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editingFolderName}
            onChange={(e) => onEditingNameChange(e.target.value)}
            onKeyDown={(e) => onKeyDown(e, folder.id)}
            className="w-full border border-blue-500 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
          />
        ) : (
          <button
            type="button"
            onClick={() => onOpen(folder)}
            className="flex items-center gap-3 min-w-0 text-left flex-1"
          >
            <span className="text-4xl shrink-0">📁</span>
            <span className="font-medium text-gray-800 truncate">{folder.name}</span>
          </button>
        )}

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
            <div
              className="absolute right-0 top-9 z-50 w-36 bg-white border rounded-lg shadow-lg py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" onClick={() => onRename(folder)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                Rename
              </button>
              <button type="button" onClick={() => onMove(folder)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                Move
              </button>
              <button type="button" onClick={() => onDelete(folder.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {folder.updated_at
            ? new Date(folder.updated_at).toLocaleDateString("en-US", {
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
            onStar("folder", folder.id);
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
  );
}
