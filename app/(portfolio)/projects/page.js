import ProjectsPageClient from '@/components/portfolio/ProjectsPage';
import TrackPage from '@/components/TrackPage';
import { getPortfolioDoc, getCollection } from '@/lib/firestore';

export const revalidate = 60;

export async function generateMetadata() {
  try {
    const s = await getPortfolioDoc('siteSettings');
    const seo     = s?.seo?.projects || {};
    const ogImage = s?.ogImageUrl || null;
    const title       = seo.title       || 'Projects | Shakil Ahmed — Website & CMS Expert';
    const description = seo.description || 'Portfolio of 5000+ web projects — CMS development, custom web apps, SaaS platforms, and eCommerce stores delivered for global clients.';
    const images = ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [];
    return {
      title,
      description,
      keywords: 'web development portfolio, CMS projects, SaaS projects, eCommerce portfolio, custom web apps, Shakil Ahmed projects',
      alternates: { canonical: 'https://shakilxvs.com/projects' },
      openGraph: {
        title,
        description,
        url: 'https://shakilxvs.com/projects',
        type: 'website',
        images,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        creator: '@shakilxvs',
        ...(ogImage ? { images: [ogImage] } : {}),
      },
    };
  } catch {
    return { title: 'Projects | Shakil Ahmed — Website & CMS Expert' };
  }
}

export default async function Page() {
  // Fetch projects server-side for schema markup only
  let projects = [];
  try {
    projects = await getCollection('projects');
  } catch {}

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',     item: 'https://shakilxvs.com' },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: 'https://shakilxvs.com/projects' },
    ],
  };

  const itemListSchema = projects.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Web Development Projects by Shakil Ahmed',
    description: 'Portfolio of CMS, SaaS, eCommerce, and custom web app projects.',
    url: 'https://shakilxvs.com/projects',
    numberOfItems: projects.length,
    itemListElement: projects.slice(0, 20).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.title || 'Web Project',
      description: p.description || '',
      url: p.slug ? `https://shakilxvs.com/projects/${p.slug}` : 'https://shakilxvs.com/projects',
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}/>
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}/>
      )}
      <TrackPage page="projects" />
      <ProjectsPageClient />
    </>
  );
}
