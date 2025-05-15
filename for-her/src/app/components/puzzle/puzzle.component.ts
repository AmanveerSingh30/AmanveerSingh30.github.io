import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Position {
  x: number;
  y: number;
}

@Component({
  selector: 'app-puzzle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.scss']
})
export class PuzzleComponent implements OnInit {
  gridCells: number[] = Array(9).fill(0).map((_, i) => i);
  puzzlePieces: number[] = Array(9).fill(0).map((_, i) => i);
  piecePositions: Position[] = [];

  private readonly PIECE_SIZE = 100; // Size of each piece
  private readonly MIN_SPACING = 20; // Minimum space between pieces
  private readonly GRID_SIZE = 300; // Total grid size (3x100)
  private usedPositions: Position[] = [];

  constructor() {
    console.log('Puzzle component initialized');
    this.initializePiecePositions();
  }

  ngOnInit() {
    console.log('Piece positions:', this.piecePositions);
  }

  private initializePiecePositions() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const gridLeft = centerX - this.GRID_SIZE / 2;
    const gridRight = centerX + this.GRID_SIZE / 2;
    const gridTop = centerY - this.GRID_SIZE / 2;
    const gridBottom = centerY + this.GRID_SIZE / 2;

    console.log('Grid boundaries:', { gridLeft, gridRight, gridTop, gridBottom });

    this.puzzlePieces.forEach(() => {
      let position = this.generateValidPosition(gridLeft, gridRight, gridTop, gridBottom);
      this.piecePositions.push(position);
    });
  }

  private generateValidPosition(gridLeft: number, gridRight: number, gridTop: number, gridBottom: number): Position {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const padding = this.PIECE_SIZE + this.MIN_SPACING;
      let x = Math.random() * (window.innerWidth - padding * 2) + padding;
      let y = Math.random() * (window.innerHeight - padding * 2) + padding;

      // Check if position is inside grid area
      const isInGrid = x > gridLeft - this.PIECE_SIZE &&
                      x < gridRight + this.PIECE_SIZE &&
                      y > gridTop - this.PIECE_SIZE &&
                      y < gridBottom + this.PIECE_SIZE;

      // If position is in grid area, try again
      if (isInGrid) {
        attempts++;
        continue;
      }

      // Check if position overlaps with existing pieces
      const hasOverlap = this.usedPositions.some(pos =>
        Math.abs(pos.x - x) < (this.PIECE_SIZE + this.MIN_SPACING) &&
        Math.abs(pos.y - y) < (this.PIECE_SIZE + this.MIN_SPACING)
      );

      if (!hasOverlap) {
        console.log('Found valid position:', { x, y });
        this.usedPositions.push({ x, y });
        return { x, y };
      }

      attempts++;
    }

    // Fallback position if we can't find a valid spot
    console.log('Could not find valid position, using fallback');
    return { x: 0, y: 0 };
  }
}
