export default function MoveModal({
  movingFolder,
  moveDestinationPath,
  moveFolders,
  moveError,
  isMoveLoading,
  isMoving,
  onClose,
  onRoot,
  onPathClick,
  onBack,
  onDestination,
  onMove,
}) {
  if (!movingFolder) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-6" onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-800">Move folder</h2>
            <p className="text-sm text-gray-500 truncate mt-1">{movingFolder.name}</p>
          </div>

          <button type="button" onClick={onClose} disabled={isMoving} className="text-gray-500 hover:text-gray-900 text-xl disabled:opacity-50">
            ✕
          </button>
        </div>

        <div className="px-5 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <button type="button" onClick={onRoot} className="text-blue-600 hover:underline font-medium">
              My Drive
            </button>

            {moveDestinationPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center gap-2">
                <span className="text-gray-400">/</span>
                <button type="button" onClick={() => onPathClick(index)} className="text-blue-600 hover:underline">
                  {folder.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">
          {moveDestinationPath.length > 0 && (
            <button type="button" onClick={onBack} disabled={isMoveLoading || isMoving} className="mb-4 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-50">
              ← Back
            </button>
          )}

          {moveError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {moveError}
            </div>
          )}

          <p className="text-sm font-medium text-gray-700 mb-3">Choose destination</p>

          <div className="border rounded-lg max-h-72 overflow-y-auto">
            {isMoveLoading ? (
              <div className="py-10 text-center text-sm text-gray-500">Loading folders...</div>
            ) : moveFolders.length > 0 ? (
              moveFolders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => onDestination(folder)}
                  disabled={isMoving}
                  className="w-full flex items-center justify-between px-4 py-3 text-left border-b last:border-b-0 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="text-xl">📁</span>
                    <span className="text-sm text-gray-800 truncate">{folder.name}</span>
                  </span>
                  <span className="text-gray-400">→</span>
                </button>
              ))
            ) : (
              <div className="py-10 text-center text-sm text-gray-500">No folders available here.</div>
            )}
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isMoving} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Cancel
            </button>

            <button
              type="button"
              onClick={onMove}
              disabled={isMoving || isMoveLoading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMoving ? "Moving..." : "Move here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
