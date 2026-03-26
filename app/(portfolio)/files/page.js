import FilesPageClient from '@/components/portfolio/FilesPageClient';
import TrackPage from '@/components/TrackPage';
import { getPortfolioDoc } from '@/lib/firestore';

export async function generateMetadata() {
  try {
    const s = await getPortfolioDoc('siteSettings');
    const seo = s?.seo?.files || {};
    return {
      title: seo.title || 'Files | Shakil — CMS & Web Expert',
      description: seo.description || 'Free templates, guides, and premium resources to help you grow your business.',
      alternates: { canonical: 'https://shakilxvs.com/files' },
    };
  } catch {
    return { title: 'Files | Shakil — CMS & Web Expert' };
  }
}

export default function Page() {
  return (
    <>
      <TrackPage page="files" />
      <FilesPageClient />
    </>
  );
}
