import React from 'react';
import { PuzzleTrainer } from '@/components/puzzle/PuzzleTrainer';

export default function PuzzlesPage() {
  return (
    <main style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Tactical Vision & Blunder Repair Lab
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Solve tactical positions derived from real master games to improve pattern recognition and eliminate game-losing mistakes
          </p>
        </div>

        <PuzzleTrainer />
      </div>
    </main>
  );
}
