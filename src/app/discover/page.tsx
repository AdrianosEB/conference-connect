'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MatchCard from '@/components/MatchCard';

export default function DiscoverPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/match?limit=10')
      .then((r) => r.json())
      .then((d) => {
        if (d.error === 'Unauthorized') { router.push('/login'); return; }
        setMatches(d.matches || []);
        setLoading(false);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleConnect = async (toUserId: string) => {
    const res = await fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toUserId }),
    });
    if (res.ok) {
      setMatches((prev) =>
        prev.map((m) => (m.userId === toUserId ? { ...m, connectionStatus: 'pending' } : m))
      );
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 page-enter">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Discover People</h1>
            <p className="text-gray-500 mt-1">Your top 10 recommended connections</p>
          </div>
          <a href="/search-intent" className="btn-secondary text-sm">
            🎯 Search by intent
          </a>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((match, i) => (
              <div key={match.userId} style={{ animationDelay: `${i * 80}ms` }} className="animate-slide-up">
                <MatchCard match={match} onConnect={handleConnect} connectionStatus={match.connectionStatus} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-16">
            <span className="text-5xl mb-4 block">🔍</span>
            <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-500 mb-6">Upload your resume and complete your profile to discover great connections.</p>
            <a href="/profile" className="btn-primary">Complete Profile</a>
          </div>
        )}
      </main>
    </div>
  );
}
