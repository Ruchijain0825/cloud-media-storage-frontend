export default function PreviewModal({ selectedFile, onClose }) {
  if (!selectedFile) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-800 truncate">{selectedFile.name}</h2>
            <p className="text-xs text-gray-500 mt-1">{selectedFile.mime_type}</p>
          </div>

          <button type="button" onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-900 text-xl">
            ✕
          </button>
        </div>

        <div className="p-5 max-h-[75vh] overflow-auto flex justify-center">
          {selectedFile.mime_type?.startsWith("image/") && (
            <img
              src={selectedFile.url}
              alt={selectedFile.name}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          )}

          {selectedFile.mime_type === "application/pdf" && (
            <iframe
              src={selectedFile.url}
              title={selectedFile.name}
              className="w-full h-[70vh] rounded-lg border"
            />
          )}

          {selectedFile.mime_type === "text/plain" && (
            <div className="py-20 text-gray-500">Text preview is not available.</div>
          )}

          {!selectedFile.mime_type?.startsWith("image/") &&
            selectedFile.mime_type !== "application/pdf" &&
            selectedFile.mime_type !== "text/plain" && (
              <div className="py-20 text-center">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-gray-600">Preview not available for this file type.</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
