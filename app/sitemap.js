export default function sitemap() {
  const baseUrl = 'https://shakilxvs.com';
  const pages = ['', '/projects', '/apps', '/files', '/reviews', '/pay', '/contact', '/services'];

  return pages.map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));
}
