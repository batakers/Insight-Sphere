/** @type {import('next').NextConfig} */
const nextConfig = {
    // Di versi Next.js 15+ dan 16, allowedDevOrigins bukan berada di dalam experimental
    allowedDevOrigins: ["192.168.1.9", "localhost", "127.0.0.1"],
    devIndicators: false,
};

export default nextConfig
