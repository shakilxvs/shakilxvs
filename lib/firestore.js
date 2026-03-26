import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Portfolio Docs (singleton documents) ────────────────────
export async function getPortfolioDoc(docName) {
  try {
    const ref = doc(db, 'portfolio', docName);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error(`getPortfolioDoc(${docName}):`, e);
    return null;
  }
}

export async function setPortfolioDoc(docName, data) {
  try {
    const ref = doc(db, 'portfolio', docName);
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (e) {
    console.error(`setPortfolioDoc(${docName}):`, e);
    throw e;
  }
}

// ─── Generic Collection Helpers ───────────────────────────────
export async function getCollection(collectionName, orderField = 'order') {
  try {
    const q = query(collection(db, collectionName), orderBy(orderField, 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    // fallback without ordering
    try {
      const snap = await getDocs(collection(db, collectionName));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e2) {
      console.error(`getCollection(${collectionName}):`, e2);
      return [];
    }
  }
}

export async function addDocument(collectionName, data) {
  try {
    const ref = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (e) {
    console.error(`addDocument(${collectionName}):`, e);
    throw e;
  }
}

export async function updateDocument(collectionName, id, data) {
  try {
    const ref = doc(db, collectionName, id);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    return true;
  } catch (e) {
    console.error(`updateDocument(${collectionName}, ${id}):`, e);
    throw e;
  }
}

export async function deleteDocument(collectionName, id) {
  try {
    await deleteDoc(doc(db, collectionName, id));
    return true;
  } catch (e) {
    console.error(`deleteDocument(${collectionName}, ${id}):`, e);
    throw e;
  }
}

// ─── Skills ───────────────────────────────────────────────────
export const getSkills  = ()       => getCollection('skills');
export const addSkill   = (data)   => addDocument('skills', data);
export const updateSkill = (id, d) => updateDocument('skills', id, d);
export const deleteSkill = (id)    => deleteDocument('skills', id);

// ─── Projects ─────────────────────────────────────────────────
export const getProjects  = ()       => getCollection('projects');
export const addProject   = (data)   => addDocument('projects', data);
export const updateProject = (id, d) => updateDocument('projects', id, d);
export const deleteProject = (id)    => deleteDocument('projects', id);

export async function getFeaturedProjects() {
  try {
    const q = query(
      collection(db, 'projects'),
      where('featured', '==', true),
      where('active', '==', true),
      orderBy('order', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('getFeaturedProjects:', e);
    return [];
  }
}

// ─── Apps ─────────────────────────────────────────────────────
export const getApps   = ()       => getCollection('apps');
export const addApp    = (data)   => addDocument('apps', data);
export const updateApp = (id, d)  => updateDocument('apps', id, d);
export const deleteApp = (id)     => deleteDocument('apps', id);

// ─── Files ────────────────────────────────────────────────────
export const getFiles   = ()       => getCollection('files');
export const addFile    = (data)   => addDocument('files', data);
export const updateFile = (id, d)  => updateDocument('files', id, d);
export const deleteFile = (id)     => deleteDocument('files', id);

// ─── Reviews ──────────────────────────────────────────────────
export async function getApprovedReviews() {
  try {
    const q = query(collection(db, 'reviews'), orderBy('approvedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('getApprovedReviews:', e);
    return [];
  }
}

export const getPendingReviews  = () => getCollection('reviews_pending',  'submittedAt');
export const getRejectedReviews = () => getCollection('reviews_rejected', 'rejectedAt');
export const updateReview       = (id, d) => updateDocument('reviews', id, d);
export const deleteReview       = (id)    => deleteDocument('reviews', id);

export async function approveReview(pendingId, data, verified = false) {
  try {
    const batch = writeBatch(db);
    const approvedRef = doc(collection(db, 'reviews'));
    batch.set(approvedRef, {
      ...data,
      verified,
      approvedAt: serverTimestamp(),
    });
    batch.delete(doc(db, 'reviews_pending', pendingId));
    await batch.commit();
    return true;
  } catch (e) {
    console.error('approveReview:', e);
    throw e;
  }
}

export async function rejectReview(pendingId, data) {
  try {
    const batch = writeBatch(db);
    const rejectedRef = doc(collection(db, 'reviews_rejected'));
    batch.set(rejectedRef, { ...data, rejectedAt: serverTimestamp() });
    batch.delete(doc(db, 'reviews_pending', pendingId));
    await batch.commit();
    return true;
  } catch (e) {
    console.error('rejectReview:', e);
    throw e;
  }
}

export async function restoreReview(rejectedId, data) {
  try {
    const batch = writeBatch(db);
    const pendingRef = doc(collection(db, 'reviews_pending'));
    batch.set(pendingRef, { ...data, status: 'pending', submittedAt: serverTimestamp() });
    batch.delete(doc(db, 'reviews_rejected', rejectedId));
    await batch.commit();
    return true;
  } catch (e) {
    console.error('restoreReview:', e);
    throw e;
  }
}

// ─── Messages ─────────────────────────────────────────────────
export async function getMessages() {
  try {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('getMessages:', e);
    return [];
  }
}

export async function getArchivedMessages() {
  try {
    const q = query(collection(db, 'messages_archived'), orderBy('archivedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('getArchivedMessages:', e);
    return [];
  }
}

export const updateMessage = (id, d) => updateDocument('messages', id, d);

export async function archiveMessage(id, data) {
  try {
    const batch = writeBatch(db);
    const archivedRef = doc(collection(db, 'messages_archived'));
    batch.set(archivedRef, { ...data, archivedAt: serverTimestamp() });
    batch.delete(doc(db, 'messages', id));
    await batch.commit();
    return true;
  } catch (e) {
    console.error('archiveMessage:', e);
    throw e;
  }
}

export const deleteMessage = (id) => deleteDocument('messages', id);

// ─── Payment ──────────────────────────────────────────────────
export const getPaymentMethods  = () => getCollection('payment_methods');
export const addPaymentMethod   = (d) => addDocument('payment_methods', d);
export const updatePaymentMethod = (id, d) => updateDocument('payment_methods', id, d);
export const deletePaymentMethod = (id)    => deleteDocument('payment_methods', id);

export const getPaymentCrypto  = () => getCollection('payment_crypto');
export const addPaymentCrypto   = (d) => addDocument('payment_crypto', d);
export const updatePaymentCrypto = (id, d) => updateDocument('payment_crypto', id, d);
export const deletePaymentCrypto = (id)    => deleteDocument('payment_crypto', id);

export const getPaymentGateways  = () => getCollection('payment_gateways');
export const addPaymentGateway   = (d) => addDocument('payment_gateways', d);
export const updatePaymentGateway = (id, d) => updateDocument('payment_gateways', id, d);
export const deletePaymentGateway = (id)    => deleteDocument('payment_gateways', id);

// ─── Batch Order Update ───────────────────────────────────────
export async function batchUpdateOrder(collectionName, items) {
  try {
    const batch = writeBatch(db);
    items.forEach((item, index) => {
      const ref = doc(db, collectionName, item.id);
      batch.update(ref, { order: index });
    });
    await batch.commit();
    return true;
  } catch (e) {
    console.error(`batchUpdateOrder(${collectionName}):`, e);
    throw e;
  }
}

// ─── Seed Data ────────────────────────────────────────────────
export async function seedSampleData() {
  const batch = writeBatch(db);

  // Hero
  batch.set(doc(db, 'portfolio', 'hero'), {
    name: 'Shakil',
    taglines: [
      'CMS & Custom Web Expert',
      'Shopify Developer',
      'Digital Marketing Strategist',
      'eCommerce Growth Hacker',
      'Conversion Rate Optimizer',
    ],
    subtitle: '6+ years building premium stores, marketing systems, and custom web experiences for global brands.',
    stat1Label: 'Projects Done',
    stat1Value: 5000,
    stat2Label: 'Happy Clients',
    stat2Value: 1200,
    stat3Label: 'Countries',
    stat3Value: 47,
    stat4Label: 'Years XP',
    stat4Value: 6,
    cta1Text: 'View My Work',
    cta1Url: '/projects',
    cta2Text: 'Hire Me',
    cta2Url: '/contact',
    profileImageUrl: 'https://res.cloudinary.com/dot2ulzin/image/upload/v1/portfolio/profile',
    responseTime: '< 2 hrs',
    updatedAt: serverTimestamp(),
  });

  // About
  batch.set(doc(db, 'portfolio', 'about'), {
    bio: 'I\'m Shakil — a CMS specialist, Shopify developer, and digital marketing expert with 6+ years of experience helping businesses scale online. I\'ve worked with 5000+ global clients across eCommerce, SaaS, and service industries.\n\nI build fast, conversion-focused websites and run data-driven ad campaigns that consistently deliver measurable ROI. My work spans Shopify, WordPress, Wix, Webflow, custom Next.js builds, Meta Ads, Google Ads, and more.',
    cvUrl: 'https://drive.google.com/file/d/your-cv-link',
    stat1Label: 'Projects',
    stat1Value: 5000,
    stat2Label: 'Clients',
    stat2Value: 1200,
    stat3Label: 'Countries',
    stat3Value: 47,
    stat4Label: 'Years',
    stat4Value: 6,
    updatedAt: serverTimestamp(),
  });

  // Contact
  batch.set(doc(db, 'portfolio', 'contact'), {
    phone: '+880 1234 567890',
    email: 'shakilxvs@gmail.com',
    whatsapp: '+880 1234 567890',
    instagram: 'https://instagram.com/shakilxvs',
    linkedin: 'https://linkedin.com/in/shakilxvs',
    twitter: 'https://twitter.com/shakilxvs',
    facebook: 'https://facebook.com/shakilxvs',
    tiktok: 'https://tiktok.com/@shakilxvs',
    workingHours: 'Mon–Fri, 9AM–11PM BST',
    showPhone: true,
    showEmail: true,
    showWhatsapp: true,
    showInstagram: true,
    showLinkedin: true,
    showTwitter: true,
    showFacebook: true,
    showTiktok: true,
    updatedAt: serverTimestamp(),
  });

  // Site Settings
  batch.set(doc(db, 'portfolio', 'siteSettings'), {
    siteName: 'Shakil — CMS & Web Expert',
    metaDescription: 'Shakil is a CMS & Custom Web Expert, Shopify Developer, and Digital Marketer with 6+ years experience and 5000+ global projects.',
    ogImageUrl: '/og-image.png',
    updatedAt: serverTimestamp(),
  });

  // Payment Banks
  batch.set(doc(db, 'portfolio', 'paymentBanks'), {
    bdt: {
      bankName: 'Dutch-Bangla Bank Limited (DBBL)',
      accountName: 'Shakil Ahmed',
      accountNumber: '1234567890',
      routing: 'DBBLDDDH',
      notes: 'For BDT transfers via remittance services',
    },
    usd: {
      bankName: 'Mercury Business Banking',
      accountName: 'Shakil Ahmed',
      accountNumber: '9876543210',
      routing: '026073150',
      notes: 'ACH / Wire / SWIFT accepted',
    },
    updatedAt: serverTimestamp(),
  });

  // Payment Wallets
  batch.set(doc(db, 'portfolio', 'paymentWallets'), {
    bkash: { number: '01234-567890' },
    nagad: { number: '01234-567890' },
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  // Skills
  const skills = [
    { name: 'Shopify Development', icon: '🛒', level: 98, color: '#96bf48', description: 'Custom themes, apps, Liquid, headless Shopify, store optimization', order: 0, active: true },
    { name: 'WordPress', icon: '📝', level: 95, color: '#21759b', description: 'Custom themes, WooCommerce, Elementor, ACF, performance tuning', order: 1, active: true },
    { name: 'Digital Marketing', icon: '📈', level: 92, color: '#00ff88', description: 'Full-funnel strategy, SEO, CRO, analytics, email marketing', order: 2, active: true },
    { name: 'Dropshipping & eCommerce', icon: '📦', level: 90, color: '#ff4500', description: 'Product research, supplier sourcing, store setup, scaling strategies', order: 3, active: true },
    { name: 'Google Ads', icon: '🔍', level: 88, color: '#fbbc04', description: 'Search, Shopping, Display, Performance Max — $50K+/mo managed spend', order: 4, active: true },
    { name: 'Meta Ads', icon: '📘', level: 87, color: '#1877f2', description: 'Facebook & Instagram ads, retargeting, lookalike audiences, creative testing', order: 5, active: true },
    { name: 'UI/UX Design', icon: '🎨', level: 85, color: '#7c3aed', description: 'Figma, wireframing, conversion-focused design, dark mode, design systems', order: 6, active: true },
    { name: 'CMS & Custom Web', icon: '⚡', level: 94, color: '#f59e0b', description: 'Next.js, React, Firebase, headless CMS, custom dashboards', order: 7, active: true },
  ];
  for (const skill of skills) {
    await addDoc(collection(db, 'skills'), { ...skill, createdAt: serverTimestamp() });
  }

  // Projects
  const projects = [
    { title: 'Shopify Fashion Store Redesign', description: 'Complete redesign of a Shopify fashion store with custom Liquid theme, product page optimization, and UX improvements that boosted CVR by 40%.', category: 'CMS', tags: ['Shopify', 'Liquid', 'UI/UX'], thumbnailUrl: 'https://picsum.photos/seed/proj1/800/450', liveUrl: 'https://shopify.com', metrics: '+40% CVR', featured: true, active: true, order: 0 },
    { title: 'WooCommerce Multi-Product Site', description: 'Built a WooCommerce store with 500+ products, custom filtering, subscription products, and Stripe integration.', category: 'CMS', tags: ['WordPress', 'WooCommerce', 'Stripe'], thumbnailUrl: 'https://picsum.photos/seed/proj2/800/450', liveUrl: 'https://wordpress.com', metrics: '500+ Products', featured: true, active: true, order: 1 },
    { title: 'Meta Ads — 4.2x ROAS Campaign', description: 'Managed $15K/month Meta Ads budget for a DTC brand, achieving 4.2x ROAS through creative testing and audience segmentation.', category: 'Marketing', tags: ['Meta Ads', 'DTC', 'ROAS'], thumbnailUrl: 'https://picsum.photos/seed/proj3/800/450', liveUrl: 'https://facebook.com/business', metrics: '4.2x ROAS', featured: true, active: true, order: 2 },
    { title: 'Google Ads $50K/mo Management', description: 'Managed a $50K/month Google Ads account across Search, Shopping, and Performance Max campaigns for an eCommerce brand.', category: 'Marketing', tags: ['Google Ads', 'Shopping', 'PMax'], thumbnailUrl: 'https://picsum.photos/seed/proj4/800/450', liveUrl: 'https://ads.google.com', metrics: '$50K/mo', featured: false, active: true, order: 3 },
    { title: 'Messify — Mess Management App', description: 'Custom Next.js application for mess/hostel management with Firebase backend, real-time updates, and mobile-first design.', category: 'Custom Built', tags: ['Next.js', 'Firebase', 'React'], thumbnailUrl: 'https://picsum.photos/seed/proj5/800/450', liveUrl: 'https://messify.vercel.app', metrics: '500+ Users', featured: false, active: true, order: 4 },
    { title: 'Wishpr — Anonymous Messaging', description: 'A viral anonymous messaging platform built with Next.js and Firebase, reaching 10K+ users in first month.', category: 'Custom Built', tags: ['Next.js', 'Firebase', 'Viral'], thumbnailUrl: 'https://picsum.photos/seed/proj6/800/450', liveUrl: 'https://wishpr.vercel.app', metrics: '10K+ Users', featured: false, active: true, order: 5 },
  ];
  for (const project of projects) {
    await addDoc(collection(db, 'projects'), { ...project, createdAt: serverTimestamp() });
  }

  // Apps
  const apps = [
    { name: 'Messify', url: 'https://messify.vercel.app', status: 'Live', featured: true, active: true, order: 0 },
    { name: 'Wishpr Xvs', url: 'https://wishpr.vercel.app', status: 'Live', featured: false, active: true, order: 1 },
    { name: 'Portfolio CMS', url: 'https://shakilxvs.com', status: 'Live', featured: false, active: true, order: 2 },
  ];
  for (const app of apps) {
    await addDoc(collection(db, 'apps'), { ...app, createdAt: serverTimestamp() });
  }

  // Files
  const files = [
    { name: 'Shopify Launch Checklist', description: 'Complete pre-launch checklist for Shopify stores — 50+ action items covering SEO, speed, payments, and CRO.', type: 'PDF', version: 'v1.0', link: 'https://drive.google.com/file/d/placeholder', price: '', active: true, order: 0 },
    { name: 'eCommerce Ad Strategy Guide', description: 'Proven ad strategy framework used across 200+ successful eCommerce brands. Covers Meta, Google, and TikTok.', type: 'PDF', version: 'v2.1', link: 'https://drive.google.com/file/d/placeholder', price: '', active: true, order: 1 },
    { name: 'Store Audit Template', description: 'Professional Shopify store audit spreadsheet. Identify conversion killers and growth opportunities fast.', type: 'XLSX', version: 'v1.0', link: 'https://buy.stripe.com/placeholder', price: '9.99', active: true, order: 2 },
  ];
  for (const file of files) {
    await addDoc(collection(db, 'files'), { ...file, createdAt: serverTimestamp() });
  }

  // Reviews
  const reviews = [
    { name: 'James Mitchell', email: 'james@example.com', service: 'Shopify Development', rating: 5, text: 'Shakil completely transformed our Shopify store. Sales went up 40% in the first month. Incredible attention to detail and communication throughout the project.', country: 'United States', countryFlag: '🇺🇸', verified: true, videoUrl: '', submittedAt: serverTimestamp(), approvedAt: serverTimestamp() },
    { name: 'Sarah Okonkwo', email: 'sarah@example.com', service: 'Meta Ads Management', rating: 5, text: 'Our ROAS went from 1.8x to 4.2x in 6 weeks. Shakil really knows Meta Ads inside out. Clear reports, proactive communication, and real results.', country: 'United Kingdom', countryFlag: '🇬🇧', verified: true, videoUrl: '', submittedAt: serverTimestamp(), approvedAt: serverTimestamp() },
    { name: 'Carlos Mendez', email: 'carlos@example.com', service: 'WordPress Development', rating: 4, text: 'Great work on our WooCommerce store. Delivered on time and the site loads super fast. Would definitely work with Shakil again on future projects.', country: 'Canada', countryFlag: '🇨🇦', verified: true, videoUrl: '', submittedAt: serverTimestamp(), approvedAt: serverTimestamp() },
  ];
  for (const review of reviews) {
    await addDoc(collection(db, 'reviews'), review);
  }

  return true;
}

// ─── File Download Counter ────────────────────────────────
export async function incrementFileDownload(fileId) {
  try {
    const { increment } = await import('firebase/firestore');
    const ref = doc(db, 'files', fileId);
    await updateDoc(ref, { downloads: increment(1) });
    return true;
  } catch (e) { console.error('incrementFileDownload:', e); return false; }
}

// ─── Message Replies ──────────────────────────────────────
export async function saveMessageReply(messageId, replyText, replyTo) {
  try {
    const ref = doc(db, 'messages', messageId);
    const { arrayUnion } = await import('firebase/firestore');
    await updateDoc(ref, {
      replies: arrayUnion({
        text: replyText,
        to: replyTo,
        sentAt: new Date().toISOString(),
      })
    });
    return true;
  } catch (e) { console.error('saveMessageReply:', e); throw e; }
}

// ─── Custom Pages ─────────────────────────────────────────
export async function getCustomPages() {
  try {
    const ref = doc(db, 'portfolio', 'customPages');
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data().pages || []) : [];
  } catch (e) { console.error('getCustomPages:', e); return []; }
}

export async function setCustomPages(pages) {
  try {
    const ref = doc(db, 'portfolio', 'customPages');
    await setDoc(ref, { pages, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (e) { console.error('setCustomPages:', e); throw e; }
}

// ─── Analytics counters ───────────────────────────────────
export async function trackPageView(page) {
  try {
    const ref = doc(db, 'analytics', 'pageViews');
    const { increment } = await import('firebase/firestore');
    await setDoc(ref, { [page]: increment(1), lastUpdated: serverTimestamp() }, { merge: true });
  } catch {}
}

export async function getAnalytics() {
  try {
    const [pvSnap, msgSnap, revSnap, filesSnap] = await Promise.all([
      getDoc(doc(db, 'analytics', 'pageViews')),
      getDocs(collection(db, 'messages')),
      getDocs(collection(db, 'reviews')),
      getDocs(collection(db, 'files')),
    ]);
    return {
      pageViews: pvSnap.exists() ? pvSnap.data() : {},
      totalMessages: msgSnap.size,
      totalReviews: revSnap.size,
      totalFiles: filesSnap.size,
    };
  } catch (e) { console.error('getAnalytics:', e); return {}; }
}

// ─── Team Members ─────────────────────────────────────────
export async function getTeamMembers() {
  try {
    const ref = doc(db, 'portfolio', 'teamMembers');
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data().members || []) : [];
  } catch (e) { console.error('getTeamMembers:', e); return []; }
}

export async function setTeamMembers(members) {
  try {
    const ref = doc(db, 'portfolio', 'teamMembers');
    await setDoc(ref, { members, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (e) { console.error('setTeamMembers:', e); throw e; }
}
