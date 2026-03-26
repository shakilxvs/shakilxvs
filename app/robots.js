export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/admin/' },
    ],
    sitemap: 'https://shakilxvs.com/sitemap.xml',
  };
}
