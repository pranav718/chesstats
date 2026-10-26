'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './AnalysisStudio.module.css';
import { ChessGame } from '@/types/chess';
import { Chessboard } from '@/components/Chessboard';
import { EvalBar } from '@/components/EvalBar';
import { AnalysisHeader } from '@/components/analysis/AnalysisHeader';
import { EvalGraph } from '@/components/analysis/EvalGraph';
import { MoveReviewPanel } from '@/components/analysis/MoveReviewPanel';
import { PlaybackControls } from '@/components/analysis/PlaybackControls';
import { AccuracyBreakdown } from '@/components/analysis/AccuracyBreakdown';
import { BlunderMotifs } from '@/components/analysis/BlunderMotifs';
import { MoveList } from '@/components/MoveList';
import { EngineSettings } from '@/components/analysis/EngineSettings';
import { ArrowData } from '@/components/ChessboardArrows';
import { STARTING_FEN } from '@/lib/constants';

interface AnalysisStudioProps {
  game: ChessGame;
}

export function AnalysisStudio({ game }: AnalysisStudioProps) {
  const [currentPly, setCurrentPly] = useState(0);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [activeTab, setActiveTab] = useState<'review' | 'moves' | 'accuracy' | 'motifs' | 'engine'>('review');
  const [boardArrows, setBoardArrows] = useState<ArrowData[]>([]);

  const currentMove = currentPly > 0 ? game.moves[currentPly - 1] : undefined;
  const currentFen = currentMove?.fen || STARTING_FEN;
  const currentEval = currentMove?.evaluation || 20;

  const handleNext = useCallback(() => {
    setCurrentPly((prev) => Math.min(game.moves.length, prev + 1));
  }, [game.moves.length]);

  const handlePrev = useCallback(() => {
    setCurrentPly((prev) => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const handleJumpKeyMoment = () => {
    const keyIndex = game.moves.findIndex(
      (m, idx) => idx >= currentPly && (m.classification === 'blunder' || m.classification === 'brilliant')
    );
    if (keyIndex !== -1) {
      setCurrentPly(keyIndex + 1);
    } else {
      setCurrentPly(0);
    }
  };

  return (
    <div className={`container ${styles.studioContainer}`}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Game Review Studio</h1>
        <div className={styles.tabGroup}>
          <button
            onClick={() => setActiveTab('review')}
            className={`${styles.tabBtn} ${activeTab === 'review' ? styles.activeTabBtn : ''}`}
          >
            Review & Eval
          </button>
          <button
            onClick={() => setActiveTab('moves')}
            className={`${styles.tabBtn} ${activeTab === 'moves' ? styles.activeTabBtn : ''}`}
          >
            Move Notation
          </button>
          <button
            onClick={() => setActiveTab('accuracy')}
            className={`${styles.tabBtn} ${activeTab === 'accuracy' ? styles.activeTabBtn : ''}`}
          >
            Precision Stats
          </button>
          <button
            onClick={() => setActiveTab('motifs')}
            className={`${styles.tabBtn} ${activeTab === 'motifs' ? styles.activeTabBtn : ''}`}
          >
            Tactical Motifs
          </button>
          <button
            onClick={() => setActiveTab('engine')}
            className={`${styles.tabBtn} ${activeTab === 'engine' ? styles.activeTabBtn : ''}`}
          >
            Engine Lines
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.boardColumn}>
          <EvalBar
            evaluation={currentEval}
            isMate={currentMove?.isMate}
            mateIn={currentMove?.mateIn}
          />

          <div className={styles.boardArea}>
            <Chessboard
              fen={currentFen}
              orientation={orientation}
              lastMoveSquares={[]}
              arrows={boardArrows}
            />

            <PlaybackControls
              currentPly={currentPly}
              totalPlies={game.moves.length}
              onGoToPly={setCurrentPly}
              onJumpKeyMoment={handleJumpKeyMoment}
              onFlipBoard={() => setOrientation((prev) => (prev === 'white' ? 'black' : 'white'))}
            />
          </div>
        </div>

        <div className={styles.sidebarColumn}>
          <AnalysisHeader game={game} />
          <EvalGraph
            moves={game.moves}
            currentPly={currentPly}
            onSelectPly={setCurrentPly}
          />

          {activeTab === 'review' && (
            <MoveReviewPanel move={currentMove} />
          )}

          {activeTab === 'moves' && (
            <MoveList
              moves={game.moves}
              currentPly={currentPly}
              onSelectPly={setCurrentPly}
            />
          )}

          {activeTab === 'accuracy' && (
            <AccuracyBreakdown game={game} />
          )}

          {activeTab === 'motifs' && (
            <BlunderMotifs game={game} />
          )}

          {activeTab === 'engine' && (
            <EngineSettings
              fen={currentFen}
              onArrowsChange={setBoardArrows}
            />
          )}
        </div>
      </div>
    </div>
  );
}
