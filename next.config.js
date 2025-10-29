/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 🚀 هذا السطر يجعل Vercel يتجاهل أخطاء ESLint أثناء عملية الـ build
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  images: {
    domains: ["future-creativity-server.vercel.app"], // لو بتعرض صور من API
  },
};

module.exports = nextConfig;
