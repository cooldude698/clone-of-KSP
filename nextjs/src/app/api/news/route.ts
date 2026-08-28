export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

// Server-side in-memory cache per state and page: key -> { timestamp, data }
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Curated high-resolution thematic images matching police & law enforcement topics
function getThematicImageForHeadline(title: string, index: number): string {
  const t = (title || '').toLowerCase();

  if (t.includes('cyber') || t.includes('scam') || t.includes('fraud') || t.includes('digital') || t.includes('online') || t.includes('bot') || t.includes('chatbot')) {
    return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80'; // Cyber Command Surveillance
  }
  if (t.includes('anpr') || t.includes('camera') || t.includes('traffic') || t.includes('corridor') || t.includes('highway') || t.includes('toll') || t.includes('patrol')) {
    return 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80'; // Police Patrol Vehicle / Emergency Response
  }
  if (t.includes('gang') || t.includes('arrest') || t.includes('apprehend') || t.includes('bust') || t.includes('rowdy') || t.includes('squad') || t.includes('murder') || t.includes('killer')) {
    return 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=1200&auto=format&fit=crop&q=80'; // Police Tactical Squad Night Operation
  }
  if (t.includes('coastal') || t.includes('maritime') || t.includes('sea') || t.includes('vessel') || t.includes('port') || t.includes('mangaluru')) {
    return 'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=1200&auto=format&fit=crop&q=80'; // Coastal Patrol Vessel
  }
  if (t.includes('forensic') || t.includes('lab') || t.includes('evidence') || t.includes('investigation') || t.includes('van') || t.includes('van')) {
    return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80'; // Forensic Science Laboratory
  }
  if (t.includes('court') || t.includes('dgp') || t.includes('warn') || t.includes('cm') || t.includes('fir') || t.includes('obscene') || t.includes('deal') || t.includes('action')) {
    return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80'; // Police High Command & Legal Seal
  }
  if (t.includes('rescue') || t.includes('youth') || t.includes('myanmar') || t.includes('missing') || t.includes('border') || t.includes('checkpoint')) {
    return 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&auto=format&fit=crop&q=80'; // Tactical Transit Checkpoint & Rescue
  }

  const defaultImages = [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=1200&auto=format&fit=crop&q=80',
  ];
  return defaultImages[index % defaultImages.length];
}

const MOCK_CRIME_NEWS = [
  {
    title: 'Karnataka Police Deploy AI-Powered ANPR Grid Across High-Density Corridors',
    description: 'The Karnataka State Police command center has activated real-time ANPR surveillance across Bengaluru to detect repeat offenders and stolen vehicles.',
    url: 'https://ksp.karnataka.gov.in',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80',
    publishedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    source: 'Deccan Herald',
  },
  {
    title: 'Inter-District Gang Apprehended Following Multi-City Trail Analysis in Mysuru',
    description: 'Special tactical units intercepted four suspects linked to high-value vehicle thefts following cross-jurisdictional CCTV trail mapping.',
    url: 'https://ksp.karnataka.gov.in',
    image: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=1200&auto=format&fit=crop&q=80',
    publishedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    source: 'The Hindu',
  },
  {
    title: 'Bengaluru Cyber Crime Division Neutralizes Fake Law Enforcement Scam Ring',
    description: 'Officers busted a sophisticated digital arrest scam operating out of multi-state call centers targeting senior citizens.',
    url: 'https://ksp.karnataka.gov.in',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
    publishedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    source: 'Times of India',
  },
  {
    title: 'State Police Issues High Alert and ANPR Watchlist Update for Highway Tolls',
    description: 'All major toll plazas across NH-44 and Peripheral Ring Road have updated ANPR blacklists for absconding suspects.',
    url: 'https://ksp.karnataka.gov.in',
    image: 'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=1200&auto=format&fit=crop&q=80',
    publishedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    source: 'Indian Express',
  },
  {
    title: 'Coastal Security Police Conduct Joint Maritime Surveillance Exercise Near Mangaluru',
    description: 'Enhanced radar tracking and patrol vessel coordination completed along Karnataka\'s 320km coastal corridor.',
    url: 'https://ksp.karnataka.gov.in',
    image: 'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=1200&auto=format&fit=crop&q=80',
    publishedAt: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
    source: 'Deccan Chronicle',
  },
  {
    title: 'Hubballi-Dharwad Police Launch Community Crime Watch and Rapid Patrol Units',
    description: 'New quick-response motor patrols integrated with GIS mapping to reduce response times below 7 minutes.',
    url: 'https://ksp.karnataka.gov.in',
    image: 'https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=1200&auto=format&fit=crop&q=80',
    publishedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    source: 'Kannada Prabha',
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stateParam = (searchParams.get('state') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

    const isAllIndia = !stateParam || stateParam.toLowerCase() === 'all india';
    const cacheKey = `${isAllIndia ? 'all-india' : stateParam.toLowerCase()}_p${page}`;
    const now = Date.now();

    // 1. Check server-side 5-minute cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      if (now - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json(cached.data);
      }
    }

    const apiKey = process.env.GNEWS_API_KEY || process.env.NEWS_API_KEY;

    // 2. If API Key is present, query GNews API
    if (apiKey) {
      const query = isAllIndia
        ? 'crime OR police OR arrest'
        : `crime OR police OR arrest ${stateParam}`;

      const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
        query
      )}&lang=en&country=in&max=10&page=${page}&apikey=${apiKey}`;

      const res = await fetch(gnewsUrl);

      if (res.ok) {
        const data = await res.json();
        const rawTotalArticles = data.totalArticles ?? 0;
        const returnedArticles = data.articles || [];

        const articles = returnedArticles.map((art: any, idx: number) => ({
          title: art.title || 'Untitled Crime Report',
          description: art.description || '',
          url: art.url || '#',
          image: art.image || getThematicImageForHeadline(art.title, idx),
          publishedAt: art.publishedAt || new Date().toISOString(),
          source: typeof art.source === 'object' ? art.source?.name || 'GNews' : art.source || 'GNews',
        }));

        const responsePayload = {
          articles,
          totalArticles: rawTotalArticles,
          totalCount: rawTotalArticles,
          page,
          hasMore: page * 10 < rawTotalArticles,
        };

        cache.set(cacheKey, { timestamp: now, data: responsePayload });
        return NextResponse.json(responsePayload);
      }
    }

    // 3. Keyless Fallback: Google News RSS Search with Keyword Thematic Image Matcher
    try {
      const rssQuery = isAllIndia ? 'crime police Karnataka India' : `crime police ${stateParam}`;
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(rssQuery)}&hl=en-IN&gl=IN&ceid=IN:en`;
      const rssRes = await fetch(rssUrl);

      if (rssRes.ok) {
        const xmlText = await rssRes.text();
        const items: any[] = [];
        const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?<source[^>]*>(.*?)<\/source>[\s\S]*?<\/item>/g;

        let match;
        while ((match = itemRegex.exec(xmlText)) !== null && items.length < 10) {
          const rawTitle = match[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/- [^-]+$/, '').trim() || 'KSP Intelligence Update';
          const srcName = match[4]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() || 'Google News';
          
          items.push({
            title: rawTitle,
            description: `Latest law enforcement and public security briefing reported by ${srcName}.`,
            url: match[2]?.trim() || 'https://ksp.karnataka.gov.in',
            image: getThematicImageForHeadline(rawTitle, items.length),
            publishedAt: new Date(match[3] || Date.now()).toISOString(),
            source: srcName,
          });
        }

        if (items.length > 0) {
          const rssPayload = {
            articles: items,
            totalArticles: items.length,
            totalCount: items.length,
            page,
            hasMore: false,
            isLiveRSS: true,
          };
          cache.set(cacheKey, { timestamp: now, data: rssPayload });
          return NextResponse.json(rssPayload);
        }
      }
    } catch (rssErr) {
      console.warn('[Google News RSS Fallback Error]', rssErr);
    }

    // 4. Default Curated Intelligence Fallback
    const fallbackPayload = {
      articles: MOCK_CRIME_NEWS,
      totalArticles: MOCK_CRIME_NEWS.length,
      totalCount: MOCK_CRIME_NEWS.length,
      page,
      hasMore: false,
      isFallback: true,
    };
    cache.set(cacheKey, { timestamp: now, data: fallbackPayload });
    return NextResponse.json(fallbackPayload);
  } catch (err: any) {
    console.error('[News API Exception]', err);
    return NextResponse.json(
      {
        articles: MOCK_CRIME_NEWS,
        totalArticles: MOCK_CRIME_NEWS.length,
        totalCount: MOCK_CRIME_NEWS.length,
        page: 1,
        hasMore: false,
        isFallback: true,
      },
      { status: 200 }
    );
  }
}
