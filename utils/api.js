import axios from "axios";

// ✅ استخدم رابط السيرفر الحقيقي على Vercel بدلاً من localhost
const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://future-creativity-server.vercel.app/api";

// ✅ إنشاء instance للاتصال بالـ API
const API = axios.create({
  baseURL,
  withCredentials: true, // لتتبع الجلسات وطلبات OTP
});

// ✅ إضافة الـ Token (JWT) تلقائيًا إن وجد في localStorage
API.interceptors.request.use((req) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ✅ التحقق من الاتصال قبل تنفيذ أي طلب
API.interceptors.response.use(
  (res) => res,
  (error) => {
    // لو السيرفر غير متاح أو فيه مشكلة اتصال
    if (!error.response) {
      console.error("⚠️ API connection failed:", error.message);
      alert("Service temporarily unavailable. Please check your connection.");
    }
    return Promise.reject(error);
  }
);

export default API;
