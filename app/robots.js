export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/portal/'] },
    ],
    sitemap: 'https://shakilxvs.com/sitemap.xml',
  };
}
