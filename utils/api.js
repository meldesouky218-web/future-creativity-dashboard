import axios from "axios";

// 🔹 تحديد عنوان الـ API حسب البيئة
const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (
    typeof window !== "undefined" &&
    window.location.hostname.includes("localhost")
  )
    return "http://localhost:5000/api";
  return "https://future-creativity-server.vercel.app/api";
};

const baseURL = getBaseURL();
console.log("🌍 Using API URL:", baseURL);

// 🔹 إنشاء instance من axios
const API = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ✅ ضروري لنقل الكوكيز بين الدومينات
});

/* ======================================================
   🔄 Interceptor لتجديد التوكن تلقائيًا عند انتهاء الجلسة
====================================================== */
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // لو السيرفر رجع Unauthorized
    if (
      err.response &&
      err.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      console.warn("🔄 Access token expired, trying to refresh...");

      try {
        // ✅ نحاول نطلب توكن جديد
        await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });

        // 🔁 نعيد تنفيذ الطلب اللي فشل بعد التجديد
        return API(originalRequest);
      } catch (refreshError) {
        console.error("❌ Refresh token failed:", refreshError.message);

        // 🧹 لو فشل التجديد، نحذف الكوكيز ونسجل خروج المستخدم
        if (typeof window !== "undefined") {
          alert("Session expired. Please log in again.");
          window.location.href = "/login";
        }
      }
    }

    // ⛔️ أي خطأ آخر يرجع عادي
    throw err;
  }
);

export default API;
