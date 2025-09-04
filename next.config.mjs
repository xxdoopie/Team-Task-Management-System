/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
<<<<<<< HEAD
    // Force Next.js to use PostCSS instead of lightningcss
=======
    // Disable LightningCSS (forces Next.js to use PostCSS instead)
>>>>>>> 1719561 (Fix: disable LightningCSS to fix Vercel build error)
    optimizeCss: false,
  },
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
  },
};

export default nextConfig;
