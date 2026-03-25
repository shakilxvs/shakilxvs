import ProjectsPageClient from '@/components/portfolio/ProjectsPage';
import TrackPage from '@/components/TrackPage';
import { getPortfolioDoc } from '@/lib/firestore';

export async function generateMetadata() {
  try {
    const s = await getPortfolioDoc('siteSettings');
    const seo = s?.seo?.projects || {};
    return {
      title: seo.title || 'Projects | Shakil — CMS & Web Expert',
      description: seo.description || '5000+ projects delivered. Shopify, WordPress, custom web apps and digital marketing.',
      alternates: { canonical: 'https://shakilxvs.vercel.app/projects' },
    };
  } catch {
    return { title: 'Projects | Shakil — CMS & Web Expert' };
  }
}

export default function Page() {
  return (
    <>
      <TrackPage page="projects" />
      <ProjectsPageClient />
    </>
  );
}
