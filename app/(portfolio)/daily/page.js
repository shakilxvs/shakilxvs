import { getPublishedDailyPosts, getPortfolioDoc } from '@/lib/firestore';
import DailyFeed from '@/components/portfolio/DailyFeed';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const hero = await getPortfolioDoc('hero').catch(() => null);
  const name = hero?.name || 'Shakil Ahmed';
  return {
    title: `Daily — ${name} | Moments & Life`,
    description: `Daily life updates, thoughts, and behind-the-scenes moments from ${name} — web developer and digital marketer.`,
    alternates: { canonical: 'https://shakilxvs.com/daily' },
    openGraph: {
      title: `Daily — ${name}`,
      description: 'Moments, thoughts and behind the scenes.',
      url: 'https://shakilxvs.com/daily',
      type: 'profile',
      ...(hero?.profileImageUrl ? { images: [{ url: hero.profileImageUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `Daily — ${name}`,
      description: 'Moments, thoughts and behind the scenes.',
      creator: '@shakilxvs',
    },
  };
}

// Serialize any Firestore Timestamp → ISO string so Next.js can pass it
// as a prop from server component to client component without throwing.
function toISO(val) {
  if (!val) return null;
  if (typeof val.toDate === 'function') return val.toDate().toISOString();
  if (val.seconds) return new Date(val.seconds * 1000).toISOString();
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'string') return val;
  return null;
}

export default async function DailyPage() {
  const [raw, heroDoc] = await Promise.all([
    getPublishedDailyPosts().catch(() => []),
    getPortfolioDoc('hero').catch(() => null),
  ]);

  // Serialize Timestamp fields — Next.js cannot pass Firestore objects to client
  const posts = raw.map(p => ({
    ...p,
    createdAt:   toISO(p.createdAt),
    publishedAt: toISO(p.publishedAt),
    updatedAt:   toISO(p.updatedAt),
  }));

  // Profile data — only plain strings, safe to pass directly
  const profile = {
    name:            heroDoc?.name            || 'Shakil',
    profileImageUrl: heroDoc?.profileImageUrl || '',
  };

  // ProfilePage schema — signals to AI crawlers this is a personal content feed
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `${profile.name} — Daily`,
    url: 'https://shakilxvs.com/daily',
    description: `Daily life updates, moments and behind-the-scenes from ${profile.name}.`,
    mainEntity: {
      '@type': 'Person',
      name: profile.name,
      url: 'https://shakilxvs.com',
      sameAs: [
        'https://instagram.com/shakilxvs',
        'https://twitter.com/shakilxvs',
        'https://github.com/shakilxvs',
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <DailyFeed posts={posts} profile={profile}/>
    </>
  );
}
