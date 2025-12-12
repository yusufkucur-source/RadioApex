/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "radio.cast.click"
      },
      {
        protocol: "https", 
        hostname: "firebasestorage.googleapis.com"
      },
      {
        protocol: "https",
        hostname: "www.dropbox.com"
      },
      {
        protocol: "https",
        hostname: "dl.dropboxusercontent.com"
      },
      {
        protocol: "https",
        hostname: "i.ibb.co"
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? 'https://radioapex.com' 
              : 'http://localhost:3002'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
