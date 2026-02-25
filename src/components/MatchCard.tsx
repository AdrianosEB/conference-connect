'use client';

import { MatchResult } from '@/types';
import { useState } from 'react';

export default function MatchCard({
  match,
  onConnect,
  connectionStatus,
}: {
  match: MatchResult;
  onConnect?: (userId: string) => void;
  connectionStatus?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!onConnect) return;
    setLoading(true);
    await onConnect(match.userId);
    setLoading(false);
  };

  const scorePercent = Math.round(match.score * 100);

  return (
    <div className="card group animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {match.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display font-semibold text-gray-900 truncate">
              {match.name}
            </h3>
            <span className="badge-blue flex-shrink-0">{scorePercent}% match</span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {match.title}{match.company ? ` at ${match.company}` : ''}
          </p>
          {match.industry && (
            <span className="badge-amber mt-2 text-xs">{match.industry}</span>
          )}
          {match.summary && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{match.summary}</p>
          )}
          {match.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {match.skills.slice(0, 5).map((skill) => (
                <span key={skill} className="px-2 py-0.5 bg-gray-100 rounded-md text-xs text-gray-600">
                  {skill}
                </span>
              ))}
            </div>
          )}
          {match.reasons.length > 0 && (
            <div className="mt-3 p-3 bg-brand-50 rounded-xl">
              <p className="text-xs font-semibold text-brand-700 mb-1">Why connect?</p>
              {match.reasons.map((r, i) => (
                <p key={i} className="text-xs text-brand-600">• {r}</p>
              ))}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            {connectionStatus === 'accepted' ? (
              <a href={`/messages?user=${match.userId}`} className="btn-primary text-sm">
                Message
              </a>
            ) : connectionStatus === 'pending' ? (
              <span className="badge-amber">Request Pending</span>
            ) : (
              <button onClick={handleConnect} disabled={loading} className="btn-primary text-sm">
                {loading ? 'Sending...' : 'Connect'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
