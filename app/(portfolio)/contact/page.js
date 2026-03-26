import ContactClient from '@/components/portfolio/ContactClient';
import TrackPage from '@/components/TrackPage';

export const metadata = {
  title: 'Contact | Shakil — CMS & Web Expert',
  description: 'Get in touch with Shakil for Shopify development, digital marketing, and custom web projects.',
  alternates: { canonical: 'https://shakilxvs.com/contact' },
};

export default function ContactPage() {
  return <><TrackPage page="contact" /><ContactClient /></>;
}
