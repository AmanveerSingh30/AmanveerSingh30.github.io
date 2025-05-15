import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';
import Draggable from 'gsap/Draggable';

gsap.registerPlugin(Draggable);

interface Position {
  x: number;
  y: number;
}
interface DraggableVars {
  target: HTMLElement;
  SNAP_THRESHOLD: number;
}
interface PuzzlePiece {
  id: number;
  currentPosition: Position;
  correctPosition: Position;
  isLocked: boolean;
}

@Component({
  selector: 'app-puzzle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.scss']
})
export class PuzzleComponent implements OnInit, AfterViewInit {
  @ViewChildren('puzzlePiece') pieceElements!: QueryList<ElementRef>;

  // Arrays for grid and pieces
  gridCells: number[] = Array(9).fill(0).map((_, i) => i);
  puzzlePieces: number[] = Array(9).fill(0).map((_, i) => i);
  piecePositions: Position[] = [];

  // Constants for dimensions
  private readonly PIECE_WIDTH = 150;
  private readonly PIECE_HEIGHT = 100;
  private readonly GRID_SIZE = {
    width: 450,  // 3 * PIECE_WIDTH
    height: 300  // 3 * PIECE_HEIGHT
  };
  private readonly SNAP_THRESHOLD = 50; // Distance in pixels for snapping
  private usedPositions: Position[] = [];

  constructor() {
    console.log('Puzzle component initialized');
    this.initializePiecePositions();
  }

  ngOnInit() {
    console.log('Piece positions:', this.piecePositions);
  }

  ngAfterViewInit() {
    console.log('View initialized, setting up draggable');
    this.initializeDraggable();
  }

  private initializeDraggable() {
    console.log('Initializing draggable pieces');
    this.pieceElements.forEach((element, index) => {
      console.log(`Setting up draggable for piece ${index}`);

      const piece = element.nativeElement;
      const correctX = (index % 3) * this.PIECE_WIDTH;
      const correctY = Math.floor(index / 3) * this.PIECE_HEIGHT;
      const snapThreshold = this.SNAP_THRESHOLD;

      Draggable.create(piece, {
        type: 'x,y',
        inertia: true,
        onDragStart: function(this: DraggableVars) {
          gsap.to(this['target'], {
            scale: 1.1,
            duration: 0.2,
            zIndex: 100
          });
          console.log(`Started dragging piece ${index}`);
        },
        onDrag: function(this: DraggableVars) {
          const gridRect = document.querySelector('.puzzle-grid')?.getBoundingClientRect();
          if (!gridRect) return;

          const pieceRect = this['target'].getBoundingClientRect();
          const relativeX = pieceRect.left - gridRect.left;
          const relativeY = pieceRect.top - gridRect.top;

          if (Math.abs(relativeX - correctX) < snapThreshold &&
              Math.abs(relativeY - correctY) < snapThreshold) {
            console.log(`Piece ${index} is close to correct position`);
          }
        },
        onDragEnd: function(this: DraggableVars) {
          const gridRect = document.querySelector('.puzzle-grid')?.getBoundingClientRect();
          if (!gridRect) return;

          const pieceRect = this['target'].getBoundingClientRect();
          const relativeX = pieceRect.left - gridRect.left;
          const relativeY = pieceRect.top - gridRect.top;

          if (Math.abs(relativeX - correctX) < snapThreshold &&
              Math.abs(relativeY - correctY) < snapThreshold) {
            gsap.to(this['target'], {
              x: correctX,
              y: correctY,
              scale: 1,
              duration: 0.3,
              ease: "back.out(1)",
              onComplete: () => {
                console.log(`Piece ${index} snapped to correct position`);
              }
            });
          } else {
            gsap.to(this['target'], {
              scale: 1,
              duration: 0.2,
              zIndex: 2
            });
          }
          console.log(`Finished dragging piece ${index}`);
        }
      });
    });
  }

  private initializePiecePositions() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const gridLeft = centerX - this.GRID_SIZE.width / 2;
    const gridRight = centerX + this.GRID_SIZE.width / 2;
    const gridTop = centerY - this.GRID_SIZE.height / 2;
    const gridBottom = centerY + this.GRID_SIZE.height / 2;

    console.log('Grid boundaries:', { gridLeft, gridRight, gridTop, gridBottom });

    this.puzzlePieces.forEach(() => {
      let position = this.generateValidPosition(gridLeft, gridRight, gridTop, gridBottom);
      this.piecePositions.push(position);
    });
  }

  private generateValidPosition(gridLeft: number, gridRight: number, gridTop: number, gridBottom: number): Position {
    let attempts = 0;
    const maxAttempts = 100;
    const screenPadding = 20;

    while (attempts < maxAttempts) {
      const x = Math.random() * (window.innerWidth - this.PIECE_WIDTH - screenPadding * 2) + screenPadding;
      const y = Math.random() * (window.innerHeight - this.PIECE_HEIGHT - screenPadding * 2) + screenPadding;

      // Check if position is inside grid area
      const isInGrid = x > gridLeft - this.PIECE_WIDTH &&
                      x < gridRight + this.PIECE_WIDTH &&
                      y > gridTop - this.PIECE_HEIGHT &&
                      y < gridBottom + this.PIECE_HEIGHT;

      if (!isInGrid) {
        console.log('Found valid position:', { x, y });
        return { x, y };
      }

      attempts++;
    }

    console.log('Could not find valid position, using fallback');
    return { x: screenPadding, y: screenPadding };
  }

  private isPuzzleComplete(): boolean {
    return this.pieceElements?.toArray().every((element, index) => {
      const piece = element.nativeElement;
      const gridRect = document.querySelector('.puzzle-grid')?.getBoundingClientRect();
      if (!gridRect) return false;

      const pieceRect = piece.getBoundingClientRect();
      const relativeX = pieceRect.left - gridRect.left;
      const relativeY = pieceRect.top - gridRect.top;

      const correctX = (index % 3) * this.PIECE_WIDTH;
      const correctY = Math.floor(index / 3) * this.PIECE_HEIGHT;

      return Math.abs(relativeX - correctX) < this.SNAP_THRESHOLD &&
             Math.abs(relativeY - correctY) < this.SNAP_THRESHOLD;
    }) ?? false;
  }
}
