'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Navbar.module.css';
import { chessAudio } from '@/lib/sound';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    chessAudio.playMove();
    router.push(`/player/${encodeURIComponent(searchQuery.trim().toLowerCase())}`);
    setSearchQuery('');
  };

  const toggleSound = () => {
    const muted = chessAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      chessAudio.playMove();
    }
  };

  const links = [
    { href: '/', label: 'Overview' },
    { href: '/analysis', label: 'Analysis' },
    { href: '/openings', label: 'Openings' },
    { href: '/compare', label: 'Compare' },
    { href: '/heatmap', label: 'Heatmap' },
    { href: '/pgn', label: 'PGN Studio' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} onClick={() => chessAudio.playMove()}>
          <div className={styles.brandIcon}>♞</div>
          <span className={styles.brandText}>
            Ches<span className={styles.brandHighlight}>stats</span>
          </span>
        </Link>

        <ul className={styles.navLinks}>
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
                  onClick={() => chessAudio.playMove()}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={styles.rightSection}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </form>

          <button
            onClick={toggleSound}
            className={styles.iconBtn}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label="Toggle Sound"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>
    </nav>
  );
}
