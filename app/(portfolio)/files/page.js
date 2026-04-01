import FilesPageClient from '@/components/portfolio/FilesPageClient';
import TrackPage from '@/components/TrackPage';
import { getPortfolioDoc } from '@/lib/firestore';

export const revalidate = 60;

export async function generateMetadata() {
  try {
    const s = await getPortfolioDoc('siteSettings');
    const seo     = s?.seo?.files || {};
    const ogImage = s?.ogImageUrl || null;
    const title       = seo.title       || 'Free Resources & Files | Shakil Ahmed — Website & CMS Expert';
    const description = seo.description || 'Download free templates, guides, and premium resources for web development, CMS setup, and business growth. Curated by Shakil Ahmed.';
    const images = ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [];
    return {
      title,
      description,
      keywords: 'free web development resources, CMS templates, website templates, free downloads, Shakil Ahmed resources',
      alternates: { canonical: 'https://shakilxvs.com/files' },
      openGraph: {
        title,
        description,
        url: 'https://shakilxvs.com/files',
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
    return { title: 'Free Resources & Files | Shakil Ahmed — Website & CMS Expert' };
  }
}

export default function Page() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://shakilxvs.com' },
      { '@type': 'ListItem', position: 2, name: 'Files', item: 'https://shakilxvs.com/files' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}/>
      <TrackPage page="files" />
      <FilesPageClient />
    </>
  );
}
