/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
    // Force Next.js to use PostCSS instead of lightningcss
    optimizeCss: false,
  },
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
  },
};

export default nextConfig;
