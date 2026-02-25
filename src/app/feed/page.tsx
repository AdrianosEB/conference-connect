'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [newLink, setNewLink] = useState('');
  const [feedType, setFeedType] = useState<'global' | 'connections'>('global');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const loadPosts = () => {
    fetch(`/api/posts?feed=${feedType}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error === 'Unauthorized') { router.push('/login'); return; }
        setPosts(d.posts || []);
        setLoading(false);
      })
      .catch(() => router.push('/login'));
  };

  useEffect(() => { loadPosts(); }, [feedType, router]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosting(true);
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: newPost, linkUrl: newLink }),
    });
    setNewPost('');
    setNewLink('');
    setPosting(false);
    loadPosts();
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 page-enter">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-6">Feed</h1>

        {/* New post */}
        <form onSubmit={handlePost} className="card mb-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="input-field mb-3"
            rows={3}
            placeholder="Share something with the conference..."
          />
          <div className="flex items-center justify-between gap-3">
            <input
              type="url"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              className="input-field text-sm flex-1"
              placeholder="Add a link (optional)"
            />
            <button type="submit" disabled={posting} className="btn-primary text-sm">
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>

        {/* Feed toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFeedType('global')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              feedType === 'global' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Global Feed
          </button>
          <button
            onClick={() => setFeedType('connections')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              feedType === 'connections' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Connections
          </button>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="animate-pulse text-gray-400">Loading...</div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <span className="text-5xl mb-4 block">📝</span>
            <p className="text-gray-500">No posts yet. Be the first to share!</p>
          </div>
        )}
      </main>
    </div>
  );
}
