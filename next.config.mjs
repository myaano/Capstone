/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // allowedDevOrigins: ['192.168.1.167'],
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
