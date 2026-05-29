interface SaveToastProps {
  isDark: boolean;
}

export function SaveToast({ isDark }: SaveToastProps) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-lg"
      style={{
        backgroundColor: isDark ? '#1a3a2a' : '#ecfdf5',
        border: '1px solid ' + (isDark ? '#238636' : '#6ee7b7'),
      }}
    >
      <div
        className="flex items-center justify-center w-5 h-5 rounded-full"
        style={{
          backgroundColor: isDark ? '#238636' : '#10b981',
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 6L5 8.5L9.5 3.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span
        className="text-sm font-medium"
        style={{
          color: isDark ? '#3fb950' : '#059669',
        }}
      >
        Document saved
      </span>
    </div>
  );
}