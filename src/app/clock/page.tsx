import React from 'react';
import { ChessClock } from '@/components/clock/ChessClock';

export default function ClockPage() {
  return (
    <main style={{ padding: '3rem 0', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Tournament Chess Clock
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Competitive dual-display chess clock with Fischer increments, time trouble alarms and tap controls
          </p>
        </div>

        <ChessClock />
      </div>
    </main>
  );
}
