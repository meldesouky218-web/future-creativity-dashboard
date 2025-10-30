import axios from "axios";

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined" && window.location.hostname.includes("localhost"))
    return "http://localhost:5000/api";
  return "https://future-creativity-server.vercel.app/api";
};

const baseURL = getBaseURL();
console.log("🌍 Using API URL:", baseURL);

const API = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("❌ API Error:", err.response?.data || err.message);
    throw err;
  }
);

export default API;
