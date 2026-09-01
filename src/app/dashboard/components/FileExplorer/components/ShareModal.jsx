export default function ShareModal({
  shareFile,
  shareEmail,
  shareRole,
  shareError,
  publicLink,
  isSharing,
  setShareEmail,
  setShareRole,
  onClose,
  onShare,
  onGenerateLink,
}) {
  if (!shareFile) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-800">Share</h2>
            <p className="text-sm text-gray-500 truncate mt-1">{shareFile.name}</p>
          </div>

          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-900 text-xl">
            ✕
          </button>
        </div>

        <div className="p-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add people</label>

          <input
            type="email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            placeholder="Enter email address"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Permission</label>

            <select
              value={shareRole}
              onChange={(e) => setShareRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-blue-500"
            >
              <option value="viewer">Viewer — Can view and download</option>
              <option value="editor">Editor — Can edit and manage</option>
            </select>
          </div>

          {shareError && <p className="mt-3 text-sm text-red-500">{shareError}</p>}

          <button
            type="button"
            onClick={onShare}
            disabled={isSharing}
            className="mt-5 w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSharing ? "Sharing..." : "Share"}
          </button>
        </div>

        <div className="px-5 py-4 border-t bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-800">Public link</h3>
          <p className="text-xs text-gray-500 mt-1">Anyone with the link can access this file.</p>

          <button
            type="button"
            onClick={onGenerateLink}
            className="mt-3 border border-gray-300 bg-white rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Generate link
          </button>

          {publicLink && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={publicLink}
                readOnly
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              />

              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(publicLink)}
                className="border border-gray-300 bg-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
