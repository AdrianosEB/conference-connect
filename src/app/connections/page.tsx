'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function ConnectionsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'connections' | 'received' | 'sent'>('connections');
  const [data, setData] = useState<any>({ connections: [], received: [], sent: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    fetch('/api/connections')
      .then((r) => r.json())
      .then((d) => {
        if (d.error === 'Unauthorized') { router.push('/login'); return; }
        setData(d);
        setLoading(false);
      })
      .catch(() => router.push('/login'));
  };

  useEffect(() => { fetchData(); }, [router]);

  const handleAction = async (id: string, action: 'accepted' | 'declined') => {
    await fetch('/api/connections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: id, status: action }),
    });
    fetchData();
  };

  const accepted = (data.connections || []).filter((c: any) => c.status === 'accepted');
  const pendingReceived = (data.received || []).filter((c: any) => c.status === 'pending');
  const sentPending = (data.sent || []).filter((c: any) => c.status === 'pending');

  const tabs = [
    { key: 'connections', label: `Connections (${accepted.length})` },
    { key: 'received', label: `Received (${pendingReceived.length})` },
    { key: 'sent', label: `Sent (${sentPending.length})` },
  ];

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 page-enter">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-6">Connections</h1>

        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.key ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="animate-pulse text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-3">
            {tab === 'connections' && accepted.map((c: any) => (
              <div key={c.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
                    {c.otherUser?.name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{c.otherUser?.name}</p>
                    <p className="text-sm text-gray-500">{c.otherUser?.title}{c.otherUser?.company ? ` at ${c.otherUser.company}` : ''}</p>
                  </div>
                </div>
                <a href={`/messages?user=${c.otherUser?.userId}`} className="btn-primary text-sm">Message</a>
              </div>
            ))}

            {tab === 'received' && pendingReceived.map((c: any) => (
              <div key={c.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
                    {c.fromUser?.name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{c.fromUser?.name}</p>
                    <p className="text-sm text-gray-500">{c.fromUser?.title}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(c.id, 'accepted')} className="btn-primary text-sm">Accept</button>
                  <button onClick={() => handleAction(c.id, 'declined')} className="btn-secondary text-sm">Decline</button>
                </div>
              </div>
            ))}

            {tab === 'sent' && sentPending.map((c: any) => (
              <div key={c.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
                    {c.toUser?.name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{c.toUser?.name}</p>
                    <p className="text-sm text-gray-500">{c.toUser?.title}</p>
                  </div>
                </div>
                <span className="badge-amber">Pending</span>
              </div>
            ))}

            {((tab === 'connections' && accepted.length === 0) ||
              (tab === 'received' && pendingReceived.length === 0) ||
              (tab === 'sent' && sentPending.length === 0)) && (
              <div className="card text-center py-12">
                <p className="text-gray-500">Nothing here yet</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
