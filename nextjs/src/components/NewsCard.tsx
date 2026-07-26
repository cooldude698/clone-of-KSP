'use client';

import { useState } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

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
      <Card className="h-full flex flex-col justify-between p-4 hover:border-steel-600/80 transition-colors duration-200 group">
        <div>
          {/* Article Image Container / Fallback */}
          <div className="w-full h-40 rounded-md bg-void-000 border border-steel-600/30 overflow-hidden mb-3 relative flex items-center justify-center">
            {image && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-steel-600 gap-1.5 p-4 text-center">
                <Newspaper className="w-8 h-8 opacity-60 text-paper-100/40" />
                <span className="text-[10px] font-mono text-paper-100/40 uppercase tracking-wider">
                  Crime Feed Media
                </span>
              </div>
            )}
          </div>

          {/* Article Title (2-line clamp) */}
          <h3 className="text-sm font-semibold text-paper-100 line-clamp-2 leading-snug group-hover:text-phosphor-500 transition-colors">
            {title}
          </h3>

          {/* Article Description (2-line clamp) */}
          {description && (
            <p className="text-xs text-paper-100/70 mt-1.5 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Footer: Source + Relative Time in IBM Plex Mono & Read More Link */}
        <div className="mt-4 pt-3 border-t border-steel-600/30 flex items-center justify-between font-mono text-[11px]">
          <div className="flex items-center gap-1.5 truncate text-paper-100/60 mr-2">
            <span className="font-semibold text-paper-100/80 truncate max-w-[120px]">
              {source}
            </span>
            <span>•</span>
            <span className="shrink-0 text-paper-100/50">{relativeTime}</span>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-phosphor-500 hover:underline shrink-0 inline-flex items-center gap-1"
          >
            <span>Read more</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </Card>
    </motion.div>
  );
}

