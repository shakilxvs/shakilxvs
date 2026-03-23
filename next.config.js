/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com',             pathname: '/**' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com',      pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com',            pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos',                  pathname: '/**' },
      { protocol: 'https', hostname: 'logo.clearbit.com',              pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.simpleicons.org',            pathname: '/**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.emailjs.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' https://res.cloudinary.com blob:",
              "frame-src 'self' https://www.youtube.com https://youtube.com https://player.vimeo.com https://vimeo.com",
              "connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://api.cloudinary.com https://api.emailjs.com wss:",
            ].join('; ')
          }
        ]
      }
    ];
  },
};
module.exports = nextConfig;
