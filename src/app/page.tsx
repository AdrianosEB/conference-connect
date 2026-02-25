import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-white overflow-hidden">
      {/* Hero */}
      <div className="relative">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
          <div className="absolute top-20 -left-20 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-24">
          {/* Top nav */}
          <nav className="flex items-center justify-between mb-24">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-bold">
                CC
              </span>
              <span className="font-display font-bold text-xl">Conference Connect</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-medium bg-brand-600 hover:bg-brand-500 rounded-xl transition-colors"
              >
                Get Started
              </Link>
            </div>
          </nav>

          {/* Hero content */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Networking, reimagined
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
              Meet the right people
              <br />
              <span className="bg-gradient-to-r from-brand-400 to-blue-300 bg-clip-text text-transparent">
                at every conference
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
              Upload your resume, describe who you want to meet, and let AI connect you 
              with your top 10 most relevant people to network with.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/signup"
                className="px-8 py-3.5 bg-brand-600 hover:bg-brand-500 rounded-xl text-base font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-brand-600/30"
              >
                Start Connecting →
              </Link>
              <Link
                href="/login"
                className="px-8 py-3.5 border border-gray-700 hover:border-gray-500 rounded-xl text-base font-medium text-gray-300 hover:text-white transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-gray-800 bg-surface-900">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold mb-4">How it works</h2>
            <p className="text-gray-400 max-w-lg mx-auto">Three steps to meaningful connections</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload Your Resume',
                desc: 'Our AI parses your background, skills, and expertise to understand who you are professionally.',
                icon: '📄',
              },
              {
                step: '02',
                title: 'Describe Your Intent',
                desc: 'Tell us who you want to meet — "product leaders in fintech" or "hiring data scientists".',
                icon: '🎯',
              },
              {
                step: '03',
                title: 'Get Matched',
                desc: 'Receive your Top 10 recommended connections with clear reasons why each is a great fit.',
                icon: '🤝',
              },
            ].map((f) => (
              <div
                key={f.step}
                className="relative p-8 rounded-2xl border border-gray-800 bg-gray-800/30 hover:border-brand-500/40 transition-all group"
              >
                <span className="text-4xl mb-4 block">{f.icon}</span>
                <span className="text-xs font-bold text-brand-400 tracking-widest">{f.step}</span>
                <h3 className="font-display text-xl font-semibold mt-2 mb-3">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
        <p>Conference Connect · Built for smarter networking</p>
      </footer>
    </div>
  );
}
