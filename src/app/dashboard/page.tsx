'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MatchCard from '@/components/MatchCard';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [stats, setStats] = useState({ connections: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/match?limit=5').then((r) => r.json()),
      fetch('/api/connections').then((r) => r.json()),
    ]).then(([userData, matchData, connData]) => {
      if (!userData.user) {
        router.push('/login');
        return;
      }
      setUser(userData.user);
      setMatches(matchData.matches || []);
      const accepted = (connData.connections || []).filter((c: any) => c.status === 'accepted').length;
      const pending = (connData.received || []).filter((c: any) => c.status === 'pending').length;
      setStats({ connections: accepted, pending });
      setLoading(false);
    }).catch(() => router.push('/login'));
  }, [router]);

  const handleConnect = async (toUserId: string) => {
    await fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toUserId }),
    });
    setMatches((prev) =>
      prev.map((m) => (m.userId === toUserId ? { ...m, connectionStatus: 'pending' } : m))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 page-enter">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s your networking overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Connections', value: stats.connections, icon: '⟡' },
            { label: 'Pending', value: stats.pending, icon: '⏳' },
            { label: 'Top Matches', value: matches.length, icon: '◎' },
            { label: 'Match Score', value: matches[0] ? `${Math.round(matches[0].score * 100)}%` : '—', icon: '⚡' },
          ].map((s) => (
            <div key={s.label} className="card text-center">
              <span className="text-2xl">{s.icon}</span>
              <p className="font-display text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <a href="/discover" className="card flex items-center gap-4 hover:border-brand-500 border-2 border-transparent cursor-pointer">
            <span className="text-3xl">🔍</span>
            <div>
              <p className="font-semibold text-gray-900">Discover People</p>
              <p className="text-sm text-gray-500">Find your top matches</p>
            </div>
          </a>
          <a href="/search-intent" className="card flex items-center gap-4 hover:border-brand-500 border-2 border-transparent cursor-pointer">
            <span className="text-3xl">🎯</span>
            <div>
              <p className="font-semibold text-gray-900">Search by Intent</p>
              <p className="text-sm text-gray-500">&ldquo;I want to meet...&rdquo;</p>
            </div>
          </a>
          <a href="/profile" className="card flex items-center gap-4 hover:border-brand-500 border-2 border-transparent cursor-pointer">
            <span className="text-3xl">📄</span>
            <div>
              <p className="font-semibold text-gray-900">Upload Resume</p>
              <p className="text-sm text-gray-500">Improve your matches</p>
            </div>
          </a>
        </div>

        {/* Top matches preview */}
        {matches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-gray-900">Top Matches for You</h2>
              <a href="/discover" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                See all →
              </a>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {matches.slice(0, 4).map((match) => (
                <MatchCard
                  key={match.userId}
                  match={match}
                  onConnect={handleConnect}
                  connectionStatus={match.connectionStatus}
                />
              ))}
            </div>
          </div>
        )}

        {matches.length === 0 && (
          <div className="card text-center py-12">
            <span className="text-5xl mb-4 block">📄</span>
            <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">
              Complete your profile to get matches
            </h3>
            <p className="text-gray-500 mb-6">Upload your resume and fill in your profile for personalized recommendations.</p>
            <a href="/profile" className="btn-primary">Go to Profile</a>
          </div>
        )}
      </main>
    </div>
  );
}
