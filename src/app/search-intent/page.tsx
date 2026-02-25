'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import MatchCard from '@/components/MatchCard';

const SUGGESTIONS = [
  'Product leaders in fintech',
  'Anyone hiring data scientists',
  'People working on climate tech',
  'VCs investing in AI startups',
  'Engineers building with LLMs',
  'Marketing leaders in SaaS',
];

export default function SearchIntentPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (toUserId: string) => {
    await fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toUserId }),
    });
    setResults((prev) =>
      prev.map((m) => (m.userId === toUserId ? { ...m, connectionStatus: 'pending' } : m))
    );
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 page-enter">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">Who do you want to meet?</h1>
          <p className="text-gray-500 mt-1">Describe the type of person and we&apos;ll find your best matches</p>
        </div>

        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-field flex-1"
            placeholder='e.g. "Product leaders in fintech" or "Anyone hiring data scientists"'
          />
          <button onClick={() => handleSearch()} disabled={loading} className="btn-primary px-8">
            {loading ? '...' : 'Search'}
          </button>
        </div>

        {/* Suggestions */}
        {!searched && (
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-3">Try these:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); handleSearch(s); }}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:border-brand-500 hover:text-brand-600 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
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
        ) : searched && results.length > 0 ? (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Found {results.length} match{results.length !== 1 ? 'es' : ''} for &ldquo;{query}&rdquo;
            </p>
            <div className="space-y-4">
              {results.map((match, i) => (
                <div key={match.userId} style={{ animationDelay: `${i * 80}ms` }} className="animate-slide-up">
                  <MatchCard match={match} onConnect={handleConnect} connectionStatus={match.connectionStatus} />
                </div>
              ))}
            </div>
          </div>
        ) : searched ? (
          <div className="card text-center py-12">
            <span className="text-5xl mb-4 block">🤷</span>
            <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-500">Try a different search query or broader terms.</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
