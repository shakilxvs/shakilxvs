import { getPublishedBlogPosts, getProjects, getPublishedDailyPosts } from '@/lib/firestore';
export const dynamic = 'force-dynamic';
export default async function sitemap() {
  const baseUrl = 'https://shakilxvs.com';
  const staticPages = [
    { url: baseUrl,                priority: 1.0, changeFrequency: 'weekly'  },
    { url: `${baseUrl}/projects`,  priority: 0.9, changeFrequency: 'weekly'  },
    { url: `${baseUrl}/services`,  priority: 0.9, changeFrequency: 'monthly' },
    { url: `${baseUrl}/reviews`,   priority: 0.8, changeFrequency: 'weekly'  },
    { url: `${baseUrl}/contact`,   priority: 0.8, changeFrequency: 'monthly' },
    { url: `${baseUrl}/blog`,      priority: 0.8, changeFrequency: 'weekly'  },
    { url: `${baseUrl}/daily`,     priority: 0.7, changeFrequency: 'weekly'  },
    { url: `${baseUrl}/apps`,      priority: 0.7, changeFrequency: 'monthly' },
    { url: `${baseUrl}/files`,     priority: 0.7, changeFrequency: 'monthly' },
    { url: `${baseUrl}/pay`,       priority: 0.6, changeFrequency: 'monthly' },
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
  } catch {}
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
  } catch {}
  return [...staticPages, ...projectEntries, ...blogEntries];
}
