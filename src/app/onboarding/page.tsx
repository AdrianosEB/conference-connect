'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    company: '',
    industry: '',
    interests: '',
    linkedinUrl: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      router.push('/dashboard');
    } catch (err) {
      alert('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Energy',
    'Consulting', 'Marketing', 'Manufacturing', 'Retail', 'Media',
    'Real Estate', 'Legal', 'Government', 'Non-profit', 'Other',
  ];

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">CC</div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Complete your profile</h1>
          <p className="text-gray-500 mt-2">Help us find the best matches for you</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              placeholder="e.g. Senior Product Manager"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="input-field"
              placeholder="e.g. Acme Corp"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
            <select
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select your industry</option>
              {industries.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Interests & Topics</label>
            <textarea
              value={form.interests}
              onChange={(e) => setForm({ ...form, interests: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="e.g. AI/ML, climate tech, startup scaling, product-led growth"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn URL (optional)</label>
            <input
              type="url"
              value={form.linkedinUrl}
              onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
              className="input-field"
              placeholder="https://linkedin.com/in/yourname"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Saving...' : 'Continue →'}
          </button>
          <button type="button" onClick={() => router.push('/dashboard')} className="btn-secondary w-full">
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}
