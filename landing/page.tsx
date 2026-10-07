'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('docflow-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('docflow-theme', nextTheme);
  };

  return (
    <div className="landing-wrapper">
      <header>
        <div className="container header-inner">
          <Link href="#" className="brand">DocFlow</Link>
          <button className="theme-toggle" onClick={toggleTheme}>
            {mounted && theme === 'dark' ? 'Sol' : 'Lua'}
          </button>
        </div>
      </header>
    </div>
  );
}
