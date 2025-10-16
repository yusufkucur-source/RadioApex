/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: true,
  webpack: (config) => {
    // Exclude IconAnimation directory from webpack compilation
    config.module.rules.push({
      test: /\.tsx?$/,
      include: /public\/images\/home\/IconAnimation/,
      use: 'ignore-loader'
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "radio.cast.click"
      },
      {
        protocol: "https", 
        hostname: "firebasestorage.googleapis.com"
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
