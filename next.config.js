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
              // accounts.google.com MUST be in script-src — Firebase Auth loads a script from there for the popup
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://www.emailjs.com https://www.googletagmanager.com https://www.google-analytics.com https://s.pinimg.com https://analytics.tiktok.com https://connect.facebook.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' https://res.cloudinary.com blob:",
              "frame-src 'self' https://accounts.google.com https://shakilxvs-portfolio.firebaseapp.com https://www.youtube.com https://youtube.com https://player.vimeo.com https://vimeo.com",
              "connect-src 'self' https://accounts.google.com https://apis.google.com https://oauth2.googleapis.com https://firestore.googleapis.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.cloudinary.com https://api.emailjs.com https://www.googletagmanager.com https://www.google-analytics.com wss:",
            ].join('; ')
          }
        ]
      }
    ];
  },
};
module.exports = nextConfig;
