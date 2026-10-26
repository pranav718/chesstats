'use client';

import React, { useState } from 'react';
import styles from './ExportGameModal.module.css';
import { ChessGame } from '@/types/chess';
import { downloadPgn, downloadFen, generateGameSummaryMarkdown } from '@/lib/exportGame';
import { chessAudio } from '@/lib/sound';

interface ExportGameModalProps {
  game: ChessGame;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportGameModal({ game, isOpen, onClose }: ExportGameModalProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyMarkdown = () => {
    chessAudio.playMove();
    const md = generateGameSummaryMarkdown(game);
    navigator.clipboard.writeText(md);
    setCopiedType('markdown');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyPgn = () => {
    chessAudio.playMove();
    navigator.clipboard.writeText(game.pgn);
    setCopiedType('pgn');
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Export & Share Match</h3>
          <button onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>

        <div className={styles.actions}>
          <div className={styles.actionRow}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff' }}>
                Download PGN File
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Portable Game Notation with move clocks and annotations
              </span>
            </div>
            <button
              onClick={() => {
                chessAudio.playMove();
                downloadPgn(game);
              }}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              Download
            </button>
          </div>

          <div className={styles.actionRow}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff' }}>
                Download FEN State
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Final board position string in Forsyth-Edwards notation
              </span>
            </div>
            <button
              onClick={() => {
                chessAudio.playMove();
                downloadFen(game);
              }}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              Download
            </button>
          </div>

          <div className={styles.actionRow}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff' }}>
                Copy Markdown Match Report
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Formatted report with player ratings and accuracy scores
              </span>
            </div>
            <button
              onClick={handleCopyMarkdown}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              {copiedType === 'markdown' ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          <div className={styles.actionRow}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff' }}>
                Copy Raw PGN
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Raw string to paste into Chess.com or Lichess
              </span>
            </div>
            <button
              onClick={handleCopyPgn}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              {copiedType === 'pgn' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
