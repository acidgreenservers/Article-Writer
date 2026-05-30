interface InfoModalProps {
  isDark: boolean;
  onClose: () => void;
}

export function InfoModal({ isDark, onClose }: InfoModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: isDark ? '#1c2128' : '#ffffff',
          color: isDark ? '#e6edf3' : '#1f2937',
          border: '1px solid ' + (isDark ? '#30363d' : '#e5e7eb')
        }}
      >
        <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: isDark ? '#30363d' : '#e5e7eb' }}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>📝</span> Article Writer
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:opacity-70 transition-opacity"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm leading-relaxed overflow-y-auto max-h-[70vh] dark-scroll">
          <section>
            <h3 className="font-semibold text-blue-500 mb-1">Concept & Purpose</h3>
            <p>
              Article Writer is designed to be a <strong>topologically smooth</strong> markdown environment.
              It provides a seamless bridge between structured data and fluid creative expression,
              flowing like water down a river.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-blue-500 mb-1">Database Layer (IndexedDB)</h3>
            <p>
              The application uses a robust IndexedDB storage engine with a resilient versioned
              migration system. Your articles and images are stored locally in your browser,
              guaranteeing privacy and persistence even when offline.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-blue-500 mb-1">Core Layers</h3>
            <ul className="list-disc list-inside space-y-1 opacity-90">
              <li><strong>Persistence:</strong> Local-first binary and document storage.</li>
              <li><strong>Editing:</strong> Real-time markdown parsing with auto-save.</li>
              <li><strong>Export:</strong> High-fidelity HTML and Markdown generation.</li>
              <li><strong>Stability:</strong> Comprehensive test coverage and type-safe architecture.</li>
            </ul>
          </section>

          <section>
            <p className="italic opacity-70">
              The geometry and structure of this application are hardened into production-class stability.
            </p>
          </section>
        </div>

        <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: isDark ? '#30363d' : '#e5e7eb' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
