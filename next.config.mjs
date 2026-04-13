/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows images from any secure AI provider
      },
    ],
  },
  // Suppress hydration warnings for browser extensions
  reactStrictMode: true,
};

export default nextConfig;
