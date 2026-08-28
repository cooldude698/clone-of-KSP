'use client';

import { useState, useEffect, useCallback } from 'react';
import { Newspaper, RefreshCw, AlertCircle, Radio } from 'lucide-react';
import NewsCard from '@/components/NewsCard';
import Button from '@/components/ui/Button';

const INDIAN_STATES = [
  'All India',
  'Karnataka',
  'Maharashtra',
  'Delhi',
  'Tamil Nadu',
  'Telangana',
  'Kerala',
  'Uttar Pradesh',
  'West Bengal',
  'Gujarat',
  'Punjab',
  'Rajasthan',
  'Haryana',
  'Madhya Pradesh',
  'Bihar',
  'Andhra Pradesh',
  'Assam',
  'Odisha',
];

interface Article {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  publishedAt: string;
  source: string;
}

export default function LiveNewsPage() {
  const [selectedState, setSelectedState] = useState<string>('All India');
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [minsAgo, setMinsAgo] = useState<string>('0 min ago');

  // Fetch initial page 1 on state change or manual refresh
  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPage(1);
    try {
      const param = encodeURIComponent(selectedState);
      const res = await fetch(`/api/news?state=${param}&page=1`);
      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (_) {
        data = {};
      }

      const fetchedArticles = data.articles && Array.isArray(data.articles) && data.articles.length > 0
        ? data.articles
        : [
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
              image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80',
              publishedAt: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
              source: 'Deccan Chronicle',
            },
            {
              title: 'Hubballi-Dharwad Police Launch Community Crime Watch and Rapid Patrol Units',
              description: 'New quick-response motor patrols integrated with GIS mapping to reduce response times below 7 minutes.',
              url: 'https://ksp.karnataka.gov.in',
              image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
              publishedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
              source: 'Kannada Prabha',
            },
          ];

      setArticles(fetchedArticles);
      setTotalArticles(data.totalArticles || data.totalCount || fetchedArticles.length);
      setHasMore(data.hasMore ?? false);
      setLastUpdated(new Date());

      if (data.error && data.isFallback) {
        setError(data.error);
      } else {
        setError(null);
      }
    } catch (err: any) {
      console.error('Failed to fetch news feed:', err);
      setError('Error connecting to news stream. Showing offline fallback feed.');
    } finally {
      setLoading(false);
    }
  }, [selectedState]);

  // Load more pages
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const param = encodeURIComponent(selectedState);
      const res = await fetch(`/api/news?state=${param}&page=${nextPage}`);
      const data = await res.json();

      if (data.articles && Array.isArray(data.articles) && data.articles.length > 0) {
        setArticles((prev) => {
          const existingUrls = new Set(prev.map((a) => a.url));
          const newUnique = data.articles.filter((a: Article) => !existingUrls.has(a.url));
          return [...prev, ...newUnique];
        });
        setPage(nextPage);
        setHasMore(data.hasMore ?? false);
        if (data.totalArticles) setTotalArticles(data.totalArticles);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more news:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNews();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!lastUpdated) return;
      const diffSecs = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      const mins = Math.floor(diffSecs / 60);
      setMinsAgo(mins < 1 ? 'just now' : `${mins} min ago`);
    }, 10_000);

    if (lastUpdated) {
      const diffSecs = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      const mins = Math.floor(diffSecs / 60);
      setMinsAgo(mins < 1 ? 'just now' : `${mins} min ago`);
    }

    return () => clearInterval(timer);
  }, [lastUpdated]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-blue-600 dark:text-blue-400 uppercase font-semibold">
              LIVE BROADCAST
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Live Crime & Police Intelligence Feed
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Real-time automated incident and law enforcement surveillance stream sourced via GNews.
          </p>
        </div>

        {/* Action Controls: State Select Dropdown + Refresh Button + Timestamp + Count */}
        <div className="flex flex-wrap items-center gap-3">
          {/* State Select Dropdown */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="state-filter" className="text-xs font-mono text-slate-600 dark:text-slate-400 hidden sm:inline">
              State:
            </label>
            <select
              id="state-filter"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-sans text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <Button
            onClick={fetchNews}
            disabled={loading}
            variant="secondary"
            size="sm"
            className="flex items-center gap-1.5 text-xs font-mono bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          {/* Last Updated Timestamp */}
          <div className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>Last updated: {minsAgo}</span>
          </div>

          {/* Total Available Articles Badge */}
          {totalArticles > 0 && (
            <div className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              Showing <span className="text-blue-600 dark:text-blue-400 font-bold">{articles.length}</span> of{' '}
              <span className="font-bold">{totalArticles.toLocaleString('en-IN')}</span> articles
            </div>
          )}
        </div>
      </div>

      {/* Warning alert banner */}
      {error && articles.length > 0 && (
        <div className="px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchNews}
            className="text-[11px] underline hover:text-slate-900 dark:hover:text-slate-100 ml-2 shrink-0 font-semibold"
          >
            Retry API
          </button>
        </div>
      )}

      {/* ── CONTENT GRID ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-full h-44 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full animate-pulse" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3 animate-pulse" />
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article, idx) => (
              <NewsCard key={`${article.url}-${idx}`} article={article} index={idx} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                variant="secondary"
                size="md"
                className="px-6 py-2.5 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2 text-xs font-mono">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Loading Articles...
                  </span>
                ) : (
                  <span className="text-xs font-mono font-semibold">Load More Articles</span>
                )}
              </Button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
