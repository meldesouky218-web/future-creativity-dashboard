import { useContext, createContext, useState, useCallback } from "react";

// 🧩 إنشاء Context للـ Toast
const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  // ✅ إظهار إشعار واحد فقط في المرة
  const addToast = useCallback((message, type = "info") => {
    setToast({ id: Date.now(), message, type });

    // حذف الإشعار بعد 3.5 ثانية
    setTimeout(() => setToast(null), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* ✅ مربع الإشعار */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 ${
            toast.type === "success"
              ? "bg-green-600"
              : toast.type === "error"
              ? "bg-red-600"
              : "bg-gray-700"
          }`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

// 🪄 هوك للاستخدام داخل أي صفحة
export default function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

