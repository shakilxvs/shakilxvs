import AppsPage from '@/components/portfolio/AppsPage';
import TrackPage from '@/components/TrackPage';

export const metadata = {
  title: 'Apps | Shakil — CMS & Web Expert',
  description: 'Web apps and digital products built by Shakil.',
  alternates: { canonical: 'https://shakilxvs.vercel.app/apps' },
};

export default function Page() { return <><TrackPage page="apps" /><AppsPage /></>; }
