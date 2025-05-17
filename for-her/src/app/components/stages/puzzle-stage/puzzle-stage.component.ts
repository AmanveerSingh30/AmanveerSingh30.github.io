import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PuzzlePiece {
  id: number;
  currentPosition: number;
  isSelected: boolean;
}

@Component({
  selector: 'app-puzzle-stage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './puzzle-stage.component.html',
  styleUrls: ['./puzzle-stage.component.scss']
})
export class PuzzleStageComponent implements OnInit {
  @Output() completed = new EventEmitter<void>();

  private readonly TOTAL_PIECES = 9;
  private clickCount = 0;
  private lastClickTime = 0;

  puzzlePieces: PuzzlePiece[] = [];
  selectedPieces: PuzzlePiece[] = [];
  isCompleted = false;

  private audio = new Audio();

  constructor(private cd: ChangeDetectorRef) {
    this.audio.src = 'assets/sounds/air-zoom-vacuum.mp3';
  }

  ngOnInit(): void {
    this.initializePuzzle();
  }

  initializePuzzle(): void {
    // Create puzzle pieces
    this.puzzlePieces = Array(this.TOTAL_PIECES)
      .fill(null)
      .map((_, index) => ({
        id: index,
        currentPosition: index,
        isSelected: false
      }));

    // Shuffle puzzle pieces
    this.shufflePieces();

    // Reset game state
    this.selectedPieces = [];
    this.isCompleted = false;
  }

  shufflePieces(): void {
    // Fisher-Yates shuffle algorithm
    const positions = Array(this.TOTAL_PIECES).fill(0).map((_, i) => i);

    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    // Assign shuffled positions to pieces
    this.puzzlePieces.forEach((piece, index) => {
      piece.currentPosition = positions[index];
    });
  }

  getPieceByPosition(position: number): PuzzlePiece {
    return this.puzzlePieces.find(piece => piece.currentPosition === position)!;
  }

  getImagePath(piece: PuzzlePiece): string {
    return `assets/puzzle/piece-${piece.id}.png`;
  }

  onPieceClick(piece: PuzzlePiece): void {
    if (this.isCompleted) return;

    if (piece.isSelected) {
      // Deselect if already selected
      piece.isSelected = false;
      this.selectedPieces = this.selectedPieces.filter(p => p !== piece);
      return;
    }

    // Select the piece
    piece.isSelected = true;
    this.selectedPieces.push(piece);

    // If two pieces are selected, swap them
    if (this.selectedPieces.length === 2) {
      this.swapPieces();
    }
    this.cd.detectChanges();
  }

  swapPieces(): void {
    const [pieceA, pieceB] = this.selectedPieces;

    // Swap positions
    const tempPosition = pieceA.currentPosition;
    pieceA.currentPosition = pieceB.currentPosition;
    pieceB.currentPosition = tempPosition;

    // Play sound
    this.audio.currentTime = 0;
    this.audio.play().catch(error => console.error('Audio play error:', error));

    // Clear selections
    pieceA.isSelected = false;
    pieceB.isSelected = false;
    this.selectedPieces = [];

    // Check if puzzle is solved
    this.checkCompletion();
  }

  checkCompletion(): void {
    const wasCompleted = this.isCompleted;
    this.isCompleted = this.puzzlePieces.every(piece => piece.id === piece.currentPosition);

    // Emit completion event only when the puzzle transitions from incomplete to complete
    if (!wasCompleted && this.isCompleted) {
      setTimeout(() => {
        this.completed.emit();
      }, 2000); // Wait for 2 seconds after completion to show the full picture
    }
  }

  resetPuzzle(): void {
    this.initializePuzzle();
  }

  goToNextStage(): void {
    this.completed.emit();
  }

  handleIlyClick(event: MouseEvent): void {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - this.lastClickTime;

    // Reset click count if more than 500ms between clicks
    if (timeDiff > 500) {
      this.clickCount = 0;
    }

    this.clickCount++;
    this.lastClickTime = currentTime;

    // After triple click, proceed to next stage
    if (this.clickCount === 3) {
      this.completed.emit();
      this.clickCount = 0;
    }
  }
}
