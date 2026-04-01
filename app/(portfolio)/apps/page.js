import AppsPage from '@/components/portfolio/AppsPage';
import TrackPage from '@/components/TrackPage';
import { getPortfolioDoc, getCollection } from '@/lib/firestore';

export const revalidate = 60;

export async function generateMetadata() {
  try {
    const s = await getPortfolioDoc('siteSettings');
    const seo     = s?.seo?.apps || {};
    const ogImage = s?.ogImageUrl || null;
    const title       = seo.title       || 'Apps & Tools | Shakil Ahmed — Website & CMS Expert';
    const description = seo.description || 'Web apps and digital tools built by Shakil Ahmed for businesses worldwide. Custom SaaS platforms, dashboards, and automation tools.';
    const images = ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [];
    return {
      title,
      description,
      keywords: 'web apps, SaaS tools, custom web applications, business tools, Shakil Ahmed apps, digital products',
      alternates: { canonical: 'https://shakilxvs.com/apps' },
      openGraph: {
        title,
        description,
        url: 'https://shakilxvs.com/apps',
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
    return { title: 'Apps & Tools | Shakil Ahmed — Website & CMS Expert' };
  }
}

export default async function Page() {
  let apps = [];
  try {
    apps = await getCollection('apps');
  } catch {}

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://shakilxvs.com' },
      { '@type': 'ListItem', position: 2, name: 'Apps', item: 'https://shakilxvs.com/apps' },
    ],
  };

  const itemListSchema = apps.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Web Apps & Tools by Shakil Ahmed',
    description: 'Custom web applications and digital tools built for global businesses.',
    url: 'https://shakilxvs.com/apps',
    numberOfItems: apps.length,
    itemListElement: apps.slice(0, 20).map((app, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: app.name || app.title || 'Web App',
      description: app.description || '',
      url: app.url || 'https://shakilxvs.com/apps',
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}/>
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}/>
      )}
      <TrackPage page="apps" />
      <AppsPage />
    </>
  );
}
