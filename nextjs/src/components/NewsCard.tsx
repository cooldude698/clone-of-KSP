'use client';

import { useState } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface Article {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  publishedAt: string;
  source: string;
}

interface NewsCardProps {
  article: Article;
  index?: number;
}

function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function NewsCard({ article, index = 0 }: NewsCardProps) {
  const [imgError, setImgError] = useState(false);

  const { title, description, url, image, publishedAt, source } = article;
  const relativeTime = formatRelativeTime(publishedAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      className="h-full"
    >
      <div className="h-full flex flex-col justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md rounded-xl transition-all duration-200 group">
        <div>
          {/* Article Image Container / Fallback */}
          <div className="w-full h-44 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 overflow-hidden mb-3.5 relative flex items-center justify-center">
            {image && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-1.5 p-4 text-center">
                <Newspaper className="w-8 h-8 opacity-60 text-slate-400" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  KSP Intelligence Media
                </span>
              </div>
            )}
          </div>

          {/* Article Title (2-line clamp) */}
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>

          {/* Article Description (2-line clamp) */}
          {description && (
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Footer: Source + Relative Time in IBM Plex Mono & Read More Link */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-mono text-[11px]">
          <div className="flex items-center gap-1.5 truncate text-slate-500 dark:text-slate-400 mr-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
              {source}
            </span>
            <span>•</span>
            <span className="shrink-0 text-slate-500 dark:text-slate-400">{relativeTime}</span>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 inline-flex items-center gap-1"
          >
            <span>Read more</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
