import { getPublishedBlogPosts, getProjects, getPublishedLogPosts, getLogSettings } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const baseUrl = 'https://shakilxvs.com';

  const staticPages = [
    { url: baseUrl,               priority: 1.0, changeFrequency: 'weekly'  },
    { url: `${baseUrl}/projects`, priority: 0.9, changeFrequency: 'weekly'  },
    { url: `${baseUrl}/services`, priority: 0.9, changeFrequency: 'monthly' },
    { url: `${baseUrl}/reviews`,  priority: 0.8, changeFrequency: 'weekly'  },
    { url: `${baseUrl}/contact`,  priority: 0.8, changeFrequency: 'monthly' },
    { url: `${baseUrl}/blog`,     priority: 0.8, changeFrequency: 'weekly'  },
    { url: `${baseUrl}/apps`,     priority: 0.7, changeFrequency: 'monthly' },
    { url: `${baseUrl}/files`,    priority: 0.7, changeFrequency: 'monthly' },
    { url: `${baseUrl}/pay`,      priority: 0.6, changeFrequency: 'monthly' },
  ].map(p => ({ ...p, lastModified: new Date() }));

  let projectEntries = [];
  let blogEntries    = [];

  try {
    const projects = await getProjects();
    projectEntries = projects
      .filter(p => p.slug?.trim() && p.active !== false)
      .map(p => ({
        url:             `${baseUrl}/projects/${p.slug}`,
        lastModified:    new Date(),
        changeFrequency: 'monthly',
        priority:        0.8,
      }));
  } catch {
    // Silently skip — static routes still returned
  }

  try {
    const posts = await getPublishedBlogPosts();
    blogEntries = posts
      .filter(b => b.slug?.trim())
      .map(b => ({
        url:             `${baseUrl}/blog/${b.slug}`,
        lastModified:    b.publishedAt?.toDate?.() || new Date(),
        changeFrequency: 'monthly',
        priority:        0.7,
      }));
  } catch {
    // Silently skip — static routes still returned
  }

  // Log feed + individual log posts
  let logEntries = [];
  try {
    const logSettings = await getLogSettings();
    if (logSettings?.page_enabled) {
      logEntries.push({
        url:             `${baseUrl}/log`,
        lastModified:    new Date(),
        changeFrequency: 'daily',
        priority:        0.7,
      });
      const logPosts = await getPublishedLogPosts();
      for (const p of logPosts) {
        const date = p.post_date?.toDate?.() || p.created_at?.toDate?.() || new Date();
        logEntries.push({
          url:             `${baseUrl}/log/${p.id}`,
          lastModified:    date,
          changeFrequency: 'monthly',
          priority:        0.5,
        });
      }
    }
  } catch {
    // Silently skip
  }

  return [...staticPages, ...projectEntries, ...blogEntries, ...logEntries];
}
