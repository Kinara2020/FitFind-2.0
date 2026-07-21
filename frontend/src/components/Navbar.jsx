import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  const links = [
    { to: '/', label: 'Search' },
    { to: '/quiz', label: 'Style Quiz' },
    { to: '/explore', label: 'Explore' },
    { to: '/analytics', label: 'Analytics' },
  ];
  return (
    <nav className="bg-[#13131f] border-b border-purple-900 px-6 py-4 flex items-center justify-between">
      <span className="text-2xl font-bold text-purple-400">FitFind 2.0</span>
      <div className="flex gap-6">
        {links.map(l => (
          <Link key={l.to} to={l.to}
            className={`text-sm font-medium transition-colors ${
              pathname === l.to ? 'text-purple-400' : 'text-gray-400 hover:text-white'
            }`}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}