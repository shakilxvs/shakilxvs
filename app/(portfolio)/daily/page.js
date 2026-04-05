import { getPublishedDailyPosts } from '@/lib/firestore';
import DailyFeed from '@/components/portfolio/DailyFeed';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return {
    title: 'Daily — Shakil Ahmed | Moments & Life',
    description: 'Daily life updates, thoughts, and behind-the-scenes moments from Shakil Ahmed — web developer and digital marketer.',
    alternates: { canonical: 'https://shakilxvs.com/daily' },
    openGraph: {
      title: 'Daily — Shakil Ahmed',
      description: 'Moments, thoughts and behind the scenes.',
      url: 'https://shakilxvs.com/daily',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Daily — Shakil Ahmed',
      description: 'Moments, thoughts and behind the scenes.',
      creator: '@shakilxvs',
    },
  };
}

// Serialize a Firestore Timestamp (or plain Date / ISO string) → ISO string
// Next.js App Router throws if non-serializable values are passed
// from a server component to a client component prop.
function toISO(val) {
  if (!val) return null;
  if (typeof val.toDate === 'function') return val.toDate().toISOString();
  if (val.seconds) return new Date(val.seconds * 1000).toISOString();
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'string') return val;
  return null;
}

export default async function DailyPage() {
  const raw = await getPublishedDailyPosts().catch(() => []);

  // Serialize every Timestamp field before passing to client component
  const posts = raw.map(p => ({
    ...p,
    createdAt:   toISO(p.createdAt),
    publishedAt: toISO(p.publishedAt),
    updatedAt:   toISO(p.updatedAt),
  }));

  // ProfilePage schema — signals to Google this is a personal feed
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: 'Shakil Ahmed — Daily',
    url: 'https://shakilxvs.com/daily',
    description: 'Daily life updates, moments and behind-the-scenes from Shakil Ahmed.',
    mainEntity: {
      '@type': 'Person',
      name: 'Shakil Ahmed',
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
      <DailyFeed posts={posts} />
    </>
  );
}
