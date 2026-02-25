'use client';

import { PostData } from '@/types';

export default function PostCard({ post }: { post: PostData }) {
  const timeAgo = getTimeAgo(post.createdAt);

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {post.user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="font-medium text-gray-900 text-sm">{post.user?.name}</p>
          <p className="text-xs text-gray-400">
            {post.user?.title}{post.user?.company ? ` at ${post.user.company}` : ''} · {timeAgo}
          </p>
        </div>
      </div>
      <p className="text-gray-700 whitespace-pre-wrap">{post.body}</p>
      {post.linkUrl && (
        <a
          href={post.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 transition-colors"
        >
          🔗 {new URL(post.linkUrl).hostname}
        </a>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
