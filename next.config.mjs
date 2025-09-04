/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
    // Disable LightningCSS (forces Next.js to use PostCSS instead)
    optimizeCss: false,
  },
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
  },
};

export default nextConfig;
