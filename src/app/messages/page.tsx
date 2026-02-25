'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUser = searchParams.get('user');
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [otherUserName, setOtherUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) { router.push('/login'); return; }
        setCurrentUserId(d.user.userId);
        loadThreads(d.user.userId);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const loadThreads = async (userId: string) => {
    const res = await fetch('/api/messages');
    const data = await res.json();
    setThreads(data.threads || []);
    setLoading(false);

    if (initialUser) {
      const key = [userId, initialUser].sort().join('_');
      setActiveThread(key);
      loadMessages(key);
      const thread = (data.threads || []).find((t: any) => t.threadKey === key);
      if (thread) setOtherUserName(thread.otherUser?.name || '');
    }
  };

  const loadMessages = async (threadKey: string) => {
    const res = await fetch(`/api/messages?threadKey=${threadKey}`);
    const data = await res.json();
    setMessages(data.messages || []);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const selectThread = (thread: any) => {
    setActiveThread(thread.threadKey);
    setOtherUserName(thread.otherUser?.name || '');
    loadMessages(thread.threadKey);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeThread) return;
    const toUserId = activeThread.split('_').find((id) => id !== currentUserId);
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toUserId, body: newMsg }),
    });
    setNewMsg('');
    loadMessages(activeThread);
  };

  // Polling
  useEffect(() => {
    if (!activeThread) return;
    const interval = setInterval(() => loadMessages(activeThread), 5000);
    return () => clearInterval(interval);
  }, [activeThread]);

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 page-enter">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-6">Messages</h1>
        <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
          {/* Thread list */}
          <div className="card overflow-y-auto md:col-span-1">
            {loading ? (
              <div className="animate-pulse text-gray-400 p-4">Loading...</div>
            ) : threads.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                <p>No conversations yet</p>
                <p className="mt-1">Connect with someone to start chatting!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {threads.map((t) => (
                  <button
                    key={t.threadKey}
                    onClick={() => selectThread(t)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      activeThread === t.threadKey ? 'bg-brand-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {t.otherUser?.name?.[0] || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{t.otherUser?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{t.lastMessage}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message area */}
          <div className="card md:col-span-2 flex flex-col">
            {activeThread ? (
              <>
                <div className="pb-3 mb-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-900">{otherUserName}</p>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.fromUserId === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                          msg.fromUserId === currentUserId
                            ? 'bg-brand-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                        }`}
                      >
                        {msg.body}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Type a message..."
                  />
                  <button type="submit" className="btn-primary">Send</button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-50 flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>}>
      <MessagesContent />
    </Suspense>
  );
}
