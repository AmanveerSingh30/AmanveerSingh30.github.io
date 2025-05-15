import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PuzzlePiece {
  id: number;
  currentPosition: number;
  isSelected: boolean;
}

@Component({
  selector: 'app-puzzle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.scss']
})
export class PuzzleComponent implements OnInit {

  private readonly TOTAL_PIECES = 9;
  
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
    this.isCompleted = this.puzzlePieces.every(piece => piece.id === piece.currentPosition);
    
  }
  
  resetPuzzle(): void {
    this.initializePuzzle();
  }
}
