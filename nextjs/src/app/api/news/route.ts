import { NextResponse } from 'next/server';

// Server-side in-memory cache per state: key -> { timestamp, data }
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Curated fallback police/crime news for demonstration when NEWS_API_KEY is not set or rate-limited
const MOCK_CRIME_NEWS = [
  {
    title: 'Karnataka Police Deploy AI-Powered ANPR Grid Across High-Density Corridors',
    description: 'The Karnataka State Police command center has activated real-time ANPR surveillance across Bengaluru to detect repeat offenders and stolen vehicles.',
    url: 'https://ksp.karnataka.gov.in',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    publishedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    source: 'Deccan Herald',
  },
  {
    title: 'Inter-District Gang Apprehended Following Multi-City Trail Analysis in Mysuru',
    description: 'Special tactical units intercepted four suspects linked to high-value vehicle thefts following cross-jurisdictional CCTV trail mapping.',
    url: 'https://ksp.karnataka.gov.in',
    image: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=800&auto=format&fit=crop&q=80',
    publishedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    source: 'The Hindu',
  },
  {
    title: 'Bengaluru Cyber Crime Division Neutralizes Fake Law Enforcement Scam Ring',
    description: 'Officers busted a sophisticated digital arrest scam operating out of multi-state call centers targeting senior citizens.',
    url: 'https://ksp.karnataka.gov.in',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    publishedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    source: 'Times of India',
  },
  {
    title: 'State Police Issues High Alert and ANPR Watchlist Update for Highway Tolls',
    description: 'All major toll plazas across NH-44 and Peripheral Ring Road have updated ANPR blacklists for absconding suspects.',
    url: 'https://ksp.karnataka.gov.in',
    image: 'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=800&auto=format&fit=crop&q=80',
    publishedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    source: 'Indian Express',
  },
  {
    title: 'Coastal Security Police Conduct Joint Maritime Surveillance Exercise Near Mangaluru',
    description: 'Enhanced radar tracking and patrol vessel coordination completed along Karnataka\'s 320km coastal corridor.',
    url: 'https://ksp.karnataka.gov.in',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    publishedAt: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
    source: 'Deccan Chronicle',
  },
  {
    title: 'Hubballi-Dharwad Police Launch Community Crime Watch and Rapid Patrol Units',
    description: 'New quick-response motor patrols integrated with GIS mapping to reduce response times below 7 minutes.',
    url: 'https://ksp.karnataka.gov.in',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    publishedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    source: 'Kannada Prabha',
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stateParam = (searchParams.get('state') || '').trim();

    const isAllIndia = !stateParam || stateParam.toLowerCase() === 'all india';
    const cacheKey = isAllIndia ? 'all-india' : stateParam.toLowerCase();
    const now = Date.now();

    // 1. Check server-side 5-minute cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      if (now - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json(cached.data);
      }
    }

    const apiKey = process.env.NEWS_API_KEY;

    // 2. If no NEWS_API_KEY set, return structured fallback data gracefully
    if (!apiKey) {
      const responsePayload = {
        articles: MOCK_CRIME_NEWS,
        isFallback: true,
      };
      cache.set(cacheKey, { timestamp: now, data: responsePayload });
      return NextResponse.json(responsePayload);
    }

    // 3. Construct GNews query: q=crime+OR+police+OR+arrest+(state name)
    const query = isAllIndia
      ? 'crime OR police OR arrest'
      : `crime OR police OR arrest "${stateParam}"`;

    const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
      query
    )}&lang=en&country=in&max=20&apikey=${apiKey}`;

    const res = await fetch(gnewsUrl);

    if (!res.ok) {
      const errorPayload = {
        error: `GNews API error (${res.status}): Failed to fetch live crime news feed.`,
        articles: MOCK_CRIME_NEWS,
        isFallback: true,
      };
      cache.set(cacheKey, { timestamp: now, data: errorPayload });
      return NextResponse.json(errorPayload, { status: 200 });
    }

    const data = await res.json();
    const articles = (data.articles || []).map((art: any) => ({
      title: art.title || 'Untitled Crime Report',
      description: art.description || '',
      url: art.url || '#',
      image: art.image || null,
      publishedAt: art.publishedAt || new Date().toISOString(),
      source: typeof art.source === 'object' ? art.source?.name || 'GNews' : art.source || 'GNews',
    }));

    const responsePayload = { articles };
    cache.set(cacheKey, { timestamp: now, data: responsePayload });

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    return NextResponse.json(
      {
        error: `Server error while fetching news: ${err?.message || 'Unknown error'}`,
        articles: MOCK_CRIME_NEWS,
        isFallback: true,
      },
      { status: 200 }
    );
  }
}
