'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [resume, setResume] = useState<any>(null);
  const [form, setForm] = useState({
    name: '', title: '', company: '', industry: '', interests: '', linkedinUrl: '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [consent, setConsent] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((d) => {
        if (d.error === 'Unauthorized') { router.push('/login'); return; }
        if (d.profile) {
          setProfile(d.profile);
          setForm({
            name: d.profile.name || '',
            title: d.profile.title || '',
            company: d.profile.company || '',
            industry: d.profile.industry || '',
            interests: d.profile.interests || '',
            linkedinUrl: d.profile.linkedinUrl || '',
          });
          setConsent(d.consent || false);
        }
        if (d.resume) setResume(d.resume);
        setLoading(false);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setUploadMsg('Profile saved!');
      setTimeout(() => setUploadMsg(''), 3000);
    } catch {
      setUploadMsg('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setUploadMsg('Please upload a PDF or DOCX file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadMsg('File too large. Max 10MB.');
      return;
    }
    if (!consent) {
      setUploadMsg('Please agree to share your resume-derived profile first.');
      return;
    }

    setUploading(true);
    setUploadMsg('Uploading and processing...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setUploadMsg('Resume uploaded and processed! Your matches will be updated.');
      setResume(data.resume);
      if (data.profile) {
        setProfile(data.profile);
        setForm((f) => ({
          ...f,
          industry: data.profile.industry || f.industry,
        }));
      }
    } catch (err: any) {
      setUploadMsg(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Navbar />
        <div className="flex items-center justify-center py-24 animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const skills = profile?.skillsJson ? JSON.parse(profile.skillsJson) : [];

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 page-enter">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-6">Your Profile</h1>

        {uploadMsg && (
          <div className={`mb-6 p-4 rounded-xl text-sm ${
            uploadMsg.includes('Failed') || uploadMsg.includes('Please')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {uploadMsg}
          </div>
        )}

        {/* Profile form */}
        <form onSubmit={handleSaveProfile} className="card mb-6">
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">Profile Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input type="text" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
              <textarea value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} className="input-field" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input type="url" value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} className="input-field" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary mt-4">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        {/* AI Summary */}
        {profile?.summary && (
          <div className="card mb-6">
            <h2 className="font-display text-lg font-semibold text-gray-900 mb-3">AI-Generated Summary</h2>
            <p className="text-gray-600 mb-3">{profile.summary}</p>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s: string) => (
                  <span key={s} className="badge-blue">{s}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Resume Upload */}
        <div className="card">
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">Resume / CV</h2>
          {resume && (
            <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm text-green-700">✓ Resume uploaded: {resume.fileName}</p>
            </div>
          )}
          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
            <span className="text-sm text-gray-600">I agree to share my resume-derived profile (skills, summary, industry) with other attendees.</span>
          </label>
          <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            consent ? 'border-brand-300 hover:border-brand-500 hover:bg-brand-50' : 'border-gray-200 opacity-50 cursor-not-allowed'
          }`}>
            <span className="text-3xl mb-2">📄</span>
            <span className="font-medium text-gray-700">{uploading ? 'Processing...' : 'Click to upload PDF or DOCX'}</span>
            <span className="text-xs text-gray-400 mt-1">Max 10MB</span>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleUpload}
              disabled={!consent || uploading}
              className="hidden"
            />
          </label>
        </div>
      </main>
    </div>
  );
}
