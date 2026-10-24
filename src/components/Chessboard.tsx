'use client';

import React, { useState } from 'react';
import styles from './Chessboard.module.css';
import { ChessPiece } from '@/lib/chessPieces';
import { parseFen, coordsToSquare, getTurnFromFen } from '@/lib/fenPgn';
import { chessAudio } from '@/lib/sound';
import { STARTING_FEN } from '@/lib/constants';

interface ChessboardProps {
  fen?: string;
  orientation?: 'white' | 'black';
  highlightedSquares?: string[];
  lastMoveSquares?: string[];
  checkSquare?: string;
  onSquareClick?: (square: string) => void;
  showCoordinates?: boolean;
}

export function Chessboard({
  fen = STARTING_FEN,
  orientation: initialOrientation = 'white',
  highlightedSquares = [],
  lastMoveSquares = [],
  checkSquare,
  onSquareClick,
  showCoordinates = true,
}: ChessboardProps) {
  const [orientation, setOrientation] = useState<'white' | 'black'>(initialOrientation);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  const boardMatrix = parseFen(fen);
  const turn = getTurnFromFen(fen);

  const toggleOrientation = () => {
    chessAudio.playMove();
    setOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  };

  const handleSquareClick = (square: string) => {
    setSelectedSquare((prev) => (prev === square ? null : square));
    chessAudio.playMove();
    if (onSquareClick) {
      onSquareClick(square);
    }
  };

  const squaresToRender: { row: number; col: number; square: string; piece: string | null }[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const row = orientation === 'white' ? r : 7 - r;
      const col = orientation === 'white' ? c : 7 - c;
      const square = coordsToSquare(row, col);
      const piece = boardMatrix[row]?.[col] || null;
      squaresToRender.push({ row, col, square, piece });
    }
  }

  return (
    <div className={styles.boardWrapper}>
      <div className={styles.boardContainer}>
        <div className={styles.grid}>
          {squaresToRender.map(({ row, col, square, piece }) => {
            const isLight = (row + col) % 2 === 0;
            const isSelected = selectedSquare === square;
            const isHighlighted = highlightedSquares.includes(square);
            const isLastMove = lastMoveSquares.includes(square);
            const isCheck = checkSquare === square;

            const isBottomRank = orientation === 'white' ? row === 7 : row === 0;
            const isLeftFile = orientation === 'white' ? col === 0 : col === 7;

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                className={`
                  ${styles.square} 
                  ${isLight ? styles.lightSquare : styles.darkSquare}
                  ${isSelected || isHighlighted ? styles.highlighted : ''}
                  ${isLastMove ? styles.prevMove : ''}
                  ${isCheck ? styles.inCheck : ''}
                `}
              >
                {showCoordinates && isLeftFile && (
                  <span
                    className={`${styles.coordRank} ${isLight ? styles.coordLight : styles.coordDark}`}
                  >
                    {8 - row}
                  </span>
                )}

                {showCoordinates && isBottomRank && (
                  <span
                    className={`${styles.coordFile} ${isLight ? styles.coordLight : styles.coordDark}`}
                  >
                    {square[0]}
                  </span>
                )}

                {piece && <ChessPiece piece={piece} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.turnIndicator}>
          <span
            className={`${styles.turnDot} ${
              turn === 'white' ? styles.turnDotWhite : styles.turnDotBlack
            }`}
          />
          <span>{turn === 'white' ? 'White to move' : 'Black to move'}</span>
        </div>

        <button onClick={toggleOrientation} className={styles.flipBtn} aria-label="Flip Chessboard">
          🔄 Flip Board
        </button>
      </div>
    </div>
  );
}
