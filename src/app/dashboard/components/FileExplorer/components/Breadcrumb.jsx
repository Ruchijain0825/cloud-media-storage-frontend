export default function Breadcrumb({
  currentFolderId,
  folderPath,
  onRoot,
  onBreadcrumb,
}) {
  return (
    <div className="px-6 py-5">
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <button
          type="button"
          onClick={onRoot}
          className="text-blue-600 hover:underline font-medium"
        >
          My Drive
        </button>

        {folderPath.map((folder, index) => (
          <div key={folder.id} className="flex items-center gap-2">
            <span className="text-gray-400">/</span>
            <button
              type="button"
              onClick={() => onBreadcrumb(folder, index)}
              className="text-blue-600 hover:underline"
            >
              {folder.name}
            </button>
          </div>
        ))}
      </div>

      {currentFolderId != null && (
        <button
          type="button"
          onClick={onRoot}
          className="mt-4 text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to My Drive
        </button>
      )}
    </div>
  );
}
