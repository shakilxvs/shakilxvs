/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com',          pathname: '/**' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com',   pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com',         pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos',               pathname: '/**' },
      { protocol: 'https', hostname: 'logo.clearbit.com',           pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.simpleicons.org',         pathname: '/**' },
    ],
  },
};
module.exports = nextConfig;
