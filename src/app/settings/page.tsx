'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 page-enter">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-6">Settings</h1>

        <div className="space-y-4">
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-gray-900 mb-2">Account</h2>
            <p className="text-sm text-gray-500 mb-4">Manage your account settings</p>
            <a href="/profile" className="btn-secondary text-sm">Edit Profile</a>
          </div>

          <div className="card">
            <h2 className="font-display text-lg font-semibold text-gray-900 mb-2">Privacy</h2>
            <p className="text-sm text-gray-500 mb-2">Your raw resume text is never shared. Only derived fields (skills, summary, industry) are visible to other attendees.</p>
          </div>

          <div className="card">
            <h2 className="font-display text-lg font-semibold text-gray-900 mb-2">Sign Out</h2>
            <p className="text-sm text-gray-500 mb-4">Sign out of your account on this device.</p>
            <button onClick={handleLogout} className="btn-danger text-sm">Sign Out</button>
          </div>
        </div>
      </main>
    </div>
  );
}
