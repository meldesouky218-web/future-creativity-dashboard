import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

const API = axios.create({
  baseURL,
  withCredentials: true, // ✅ مهم لطلبات تتبع الجلسات وOTP
});

// إضافة التوكن تلقائيًا لو موجود
API.interceptors.request.use((req) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API; 
