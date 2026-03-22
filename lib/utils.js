// ─── Count-up Animation ───────────────────────────────────────
export function countUp(target, duration = 2000, onUpdate) {
  const start = performance.now();
  const step = (timestamp) => {
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    onUpdate(Math.floor(eased * target));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ─── App Icon Gradient Map (A–Z deterministic) ────────────────
const LETTER_GRADIENTS = {
  A: ['#234DC2', '#1931AB'],
  B: ['#ff4500', '#cc3700'],
  C: ['#1877f2', '#1255b8'],
  D: ['#f5c518', '#c49a13'],
  E: ['#7c3aed', '#5b28c4'],
  F: ['#ec4899', '#be185d'],
  G: ['#14b8a6', '#0d9488'],
  H: ['#f97316', '#ea580c'],
  I: ['#6366f1', '#4f46e5'],
  J: ['#84cc16', '#65a30d'],
  K: ['#0ea5e9', '#0284c7'],
  L: ['#e879f9', '#d946ef'],
  M: ['#fb923c', '#f97316'],
  N: ['#34d399', '#10b981'],
  O: ['#f43f5e', '#e11d48'],
  P: ['#a78bfa', '#7c3aed'],
  Q: ['#fbbf24', '#f59e0b'],
  R: ['#60a5fa', '#3b82f6'],
  S: ['#234DC2', '#1931AB'],
  T: ['#f87171', '#ef4444'],
  U: ['#4ade80', '#22c55e'],
  V: ['#c084fc', '#a855f7'],
  W: ['#fb7185', '#f43f5e'],
  X: ['#38bdf8', '#0ea5e9'],
  Y: ['#fde68a', '#fbbf24'],
  Z: ['#86efac', '#4ade80'],
};

export function getAppGradient(name) {
  const letter = (name?.[0] || 'S').toUpperCase();
  const colors = LETTER_GRADIENTS[letter] || LETTER_GRADIENTS['S'];
  return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
}

// ─── Video URL Detection ──────────────────────────────────────
export function getVideoType(url) {
  if (!url) return null;
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  return 'direct'; // Cloudinary, MP4, etc.
}

export function getYouTubeEmbedUrl(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&controls=0&autoplay=1&mute=1&loop=1`;
  return url;
}

export function getVimeoEmbedUrl(url) {
  const match = url.match(/vimeo\.com\/(\d+)/);
  if (match) return `https://player.vimeo.com/video/${match[1]}?autoplay=1&muted=1&loop=1&background=1`;
  return url;
}

// ─── File Type Badge Color ────────────────────────────────────
export function getFileTypeBadgeClass(type) {
  const t = (type || '').toUpperCase();
  if (t === 'PDF')  return 'badge-red';
  if (t === 'ZIP')  return 'badge-amber';
  if (t === 'DOCX') return 'badge-blue';
  if (t === 'XLSX') return 'badge-green';
  if (t === 'MP4')  return 'badge-purple';
  return 'badge-grey';
}

// ─── Clipboard Copy ───────────────────────────────────────────
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
}

// ─── Format Date ──────────────────────────────────────────────
export function formatMonthYear(timestamp) {
  if (!timestamp) return '';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ─── Truncate Text ────────────────────────────────────────────
export function truncate(text, maxLength = 200) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

// ─── Image Compression ───────────────────────────────────────
export async function compressImage(file, maxSizeMB = 1) {
  try {
    const imageCompression = (await import('browser-image-compression')).default;
    return await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });
  } catch {
    return file; // return original if compression fails
  }
}

// ─── Upload to Cloudinary ─────────────────────────────────────
export async function uploadToCloudinary(file, folder = 'portfolio') {
  const compressed = await compressImage(file);
  const formData = new FormData();
  formData.append('file', compressed);
  formData.append('upload_preset', 'portfolio_uploads');
  formData.append('folder', folder);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.secure_url;
}

// ─── Star Array ───────────────────────────────────────────────
export function getStars(rating, max = 5) {
  return Array.from({ length: max }, (_, i) => i < rating ? 'full' : 'empty');
}

// ─── Average Rating ───────────────────────────────────────────
export function getAverageRating(reviews) {
  if (!reviews?.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

// ─── Rating Distribution ──────────────────────────────────────
export function getRatingDistribution(reviews) {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { if (r.rating) dist[r.rating]++; });
  return dist;
}
