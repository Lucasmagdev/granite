import { supabase } from './supabase';

function getOrCreateSessionId(): string {
  const key = 'sjg_sid';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

function parseDevice(ua: string): string {
  if (/mobile/i.test(ua)) return 'Mobile';
  if (/tablet|ipad/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\//i.test(ua)) return 'Opera';
  if (/chrome/i.test(ua)) return 'Chrome';
  if (/safari/i.test(ua)) return 'Safari';
  if (/firefox/i.test(ua)) return 'Firefox';
  return 'Outro';
}

function parseOS(ua: string): string {
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/windows/i.test(ua)) return 'Windows';
  if (/macintosh|mac os x/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Outro';
}

export async function trackPageView() {
  try {
    const ua = navigator.userAgent;
    let country: string | null = null;
    let city: string | null = null;

    try {
      const geo = await fetch('https://ipapi.co/json/').then((r) => r.json());
      country = geo.country_name || null;
      city = geo.city || null;
    } catch {
      // geo opcional — falha silenciosa
    }

    await supabase.from('page_views').insert({
      page: window.location.pathname,
      referrer: document.referrer || null,
      device: parseDevice(ua),
      browser: parseBrowser(ua),
      os: parseOS(ua),
      language: navigator.language,
      screen_width: window.screen.width,
      country,
      city,
      session_id: getOrCreateSessionId(),
    });
  } catch {
    // falha silenciosa — não impacta o site
  }
}
