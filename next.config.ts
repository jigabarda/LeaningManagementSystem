/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gulefuuwqadozgpglyek.supabase.co", // your Supabase host
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
