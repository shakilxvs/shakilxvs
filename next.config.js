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
      { protocol: 'https', hostname: 'upload.wikimedia.org',           pathname: '/**' },
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.emailjs.com https://www.googletagmanager.com https://www.google-analytics.com https://s.pinimg.com https://analytics.tiktok.com https://connect.facebook.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' https://res.cloudinary.com blob:",
              // Google OAuth popup needs accounts.google.com in frame-src
              "frame-src 'self' https://accounts.google.com https://www.youtube.com https://youtube.com https://player.vimeo.com https://vimeo.com",
              // Google OAuth also needs accounts.google.com in connect-src
              "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://firestore.googleapis.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.cloudinary.com https://api.emailjs.com https://www.googletagmanager.com https://www.google-analytics.com wss:",
            ].join('; ')
          }
        ]
      }
    ];
  },
};
module.exports = nextConfig;
