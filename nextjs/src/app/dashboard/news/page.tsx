'use client';

import { useState, useEffect, useCallback } from 'react';
import { Newspaper, RefreshCw, AlertCircle, Radio, ChevronDown } from 'lucide-react';
import NewsCard from '@/components/NewsCard';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
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
      const data = await res.json();

      if (!res.ok || (data.error && (!data.articles || data.articles.length === 0))) {
        throw new Error(data.error || 'Failed to fetch crime news feed.');
      }

      setArticles(data.articles || []);
      setTotalArticles(data.totalArticles || data.totalCount || data.articles?.length || 0);
      setHasMore(data.hasMore ?? false);
      setLastUpdated(new Date());

      if (data.error) {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while loading crime news feed.');
      setArticles([]);
      setTotalArticles(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [selectedState]);

  // Load more function for pagination (appends next page results)
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const param = encodeURIComponent(selectedState);
      const res = await fetch(`/api/news?state=${param}&page=${nextPage}`);
      const data = await res.json();

      if (data.articles && data.articles.length > 0) {
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

  // Initial fetch and fetch on state change
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNews();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  // Timer to update "Last updated: X min ago" in IBM Plex Mono font
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── HEADER & CONTROL BAR ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-steel-600/30">
        <div>
          <div className="flex items-center gap-2">
            {/* EXISTING Phosphor-500 LIVE dot signature component */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-phosphor-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-phosphor-500"></span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-phosphor-500 uppercase font-semibold">
              LIVE BROADCAST
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-paper-100 mt-1 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-phosphor-500" />
            Live Crime & Police Intelligence Feed
          </h1>
          <p className="text-xs text-paper-100/60 mt-0.5">
            Real-time automated incident and law enforcement surveillance stream sourced via GNews.
          </p>
        </div>

        {/* Action Controls: State Select Dropdown + Refresh Button + Timestamp + Count */}
        <div className="flex flex-wrap items-center gap-3">
          {/* State Select Dropdown */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="state-filter" className="text-xs font-mono text-paper-100/60 hidden sm:inline">
              State:
            </label>
            <select
              id="state-filter"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3.5 py-2 rounded-md bg-steel-700 border border-steel-600/50 text-xs font-sans text-paper-100 focus:outline-none focus:border-phosphor-500 transition-all cursor-pointer shadow-sm"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st} className="bg-steel-700 text-paper-100">
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
            className="flex items-center gap-1.5 text-xs font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          {/* Last Updated Timestamp in IBM Plex Mono */}
          <div className="text-xs font-mono text-paper-100/50 bg-steel-700/50 px-2.5 py-1.5 rounded border border-steel-600/30 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-phosphor-500" />
            <span>Last updated: {minsAgo}</span>
          </div>

          {/* Total Available Articles Badge */}
          {totalArticles > 0 && (
            <div className="text-xs font-mono text-paper-100/80 bg-steel-700 px-3 py-1.5 rounded border border-steel-600/40">
              Showing <span className="text-phosphor-500 font-bold">{articles.length}</span> of{' '}
              <span className="font-bold">{totalArticles.toLocaleString('en-IN')}</span> articles
            </div>
          )}
        </div>
      </div>

      {/* Soft warning alert banner if using fallback data */}
      {error && articles.length > 0 && (
        <div className="px-4 py-2.5 rounded-lg bg-warn-500/10 border border-warn-500/30 text-warn-500 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchNews}
            className="text-[11px] underline hover:text-paper-100 ml-2 shrink-0"
          >
            Retry API
          </button>
        </div>
      )}

      {/* ── CONTENT GRID / SKELETON / EMPTY / ERROR STATES ─────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg bg-steel-700 border border-steel-600/40 space-y-3">
              <Skeleton className="w-full h-40 rounded-md" />
              <Skeleton className="w-3/4 h-5 rounded" />
              <Skeleton className="w-full h-4 rounded" />
              <Skeleton className="w-2/3 h-4 rounded" />
              <div className="pt-2 flex justify-between">
                <Skeleton className="w-1/3 h-3 rounded" />
                <Skeleton className="w-1/4 h-3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error && articles.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="Unable to Load Live News Feed"
          description={error}
          className="py-16"
        >
          <Button onClick={fetchNews} variant="primary" size="sm" className="mt-4">
            Try Again
          </Button>
        </EmptyState>
      ) : articles.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title={`No Crime Reports Found for ${selectedState}`}
          description="There are currently no active crime or law enforcement intelligence reports recorded for this region."
          className="py-16"
        />
      ) : (
        <>
          {/* News Grid (1 col mobile, 2 tablet, 3 desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article, idx) => (
              <NewsCard key={`${article.url}-${idx}`} article={article} index={idx} />
            ))}
          </div>

          {/* Load More Button Pagination */}
          {hasMore && (
            <div className="flex flex-col items-center justify-center pt-6">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                variant="secondary"
                size="md"
                className="flex items-center gap-2 font-mono text-xs px-6 py-2.5 border-steel-600 hover:border-phosphor-500"
              >
                {loadingMore ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-phosphor-500" />
                    <span>Loading Next Page...</span>
                  </>
                ) : (
                  <>
                    <span>Load More News</span>
                    <ChevronDown className="w-4 h-4 text-phosphor-500" />
                  </>
                )}
              </Button>
              <p className="text-[11px] font-mono text-paper-100/50 mt-2">
                Page {page} • Showing {articles.length} of {totalArticles.toLocaleString('en-IN')} total results
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
