import AppsPage from '@/components/portfolio/AppsPage';
import TrackPage from '@/components/TrackPage';
import { getPortfolioDoc } from '@/lib/firestore';

export async function generateMetadata() {
  try {
    const s = await getPortfolioDoc('siteSettings');
    const seo = s?.seo?.apps || {};
    return {
      title: seo.title || 'Apps | Shakil — CMS & Web Expert',
      description: seo.description || 'Web apps and digital products built by Shakil.',
      alternates: { canonical: 'https://shakilxvs.vercel.app/apps' },
    };
  } catch {
    return { title: 'Apps | Shakil — CMS & Web Expert' };
  }
}

export default function Page() {
  return (
    <>
      <TrackPage page="apps" />
      <AppsPage />
    </>
  );
}
