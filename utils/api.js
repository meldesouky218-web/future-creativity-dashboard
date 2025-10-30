import axios from "axios";

// ✅ تحديد عنوان الـ API تلقائيًا حسب البيئة
const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname.includes("localhost")
    ? "http://localhost:5000/api"
    : "https://future-creativity-server.vercel.app/api");

console.log("🌍 Using API URL:", baseURL); // debug — يظهر مرة واحدة بالconsole

// ✅ إنشاء instance جاهز
const API = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ✅ Interceptor (اختياري) لتسجيل الأخطاء
API.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("❌ API Error:", err.response?.data || err.message);
    throw err;
  }
);

export default API;
