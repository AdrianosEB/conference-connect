'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: '⌂' },
  { href: '/discover', label: 'Discover', icon: '◎' },
  { href: '/connections', label: 'Connections', icon: '⟡' },
  { href: '/messages', label: 'Messages', icon: '✉' },
  { href: '/feed', label: 'Feed', icon: '☰' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/dashboard" className="flex items-center gap-2.5 font-display font-bold text-xl">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white text-sm">
              CC
            </span>
            <span className="hidden sm:block gradient-text">Conference Connect</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname.startsWith(item.href)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.name || 'Menu'}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                  <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Profile
                  </a>
                  <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Settings
                  </a>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${
                  pathname.startsWith(item.href)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon} {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
