import { ChangeDetectorRef, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
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
export class PuzzleStageComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() completed = new EventEmitter<void>();
  @ViewChild('raindrops') raindropsContainer!: ElementRef;

  private readonly TOTAL_PIECES = 9;
  private clickCount = 0;
  private lastClickTime = 0;
  private rainDrops: HTMLElement[] = [];
  private rainInterval: any;
  private readonly NUMBER_OF_DROPS = 50;

  puzzlePieces: PuzzlePiece[] = [];
  selectedPieces: PuzzlePiece[] = [];
  isCompleted = false;

  private audio = new Audio();

  constructor(private cd: ChangeDetectorRef, private renderer: Renderer2) {
    this.audio.src = 'assets/sounds/air-zoom-vacuum.mp3';
  }  ngOnInit(): void {
    this.initializePuzzle();
  }

  ngAfterViewInit(): void {
    // Setup rain effect after view is initialized
    this.createRainEffect();
  }

  ngOnDestroy(): void {
    // Clean up the rain animation interval when component is destroyed
    if (this.rainInterval) {
      clearInterval(this.rainInterval);
    }

    // Stop audio if playing
    this.audio.pause();
    this.audio.currentTime = 0;
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
    // return `assets/puzzle/piece-${piece.id}.png`;
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

  }

  resetPuzzle(): void {
    this.initializePuzzle();
  }

  goToNextStage(): void {
    this.completed.emit();
  }  handleIlyClick(event: MouseEvent): void {
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

  private createRainEffect(): void {
    // Get the rain drops container
    const container = document.querySelector('.rain-drops') as HTMLElement;
    if (!container) return;

    // Create initial rain drops
    for (let i = 0; i < this.NUMBER_OF_DROPS; i++) {
      this.createRainDrop(container);
    }

    // Continuously add new raindrops to maintain the effect
    this.rainInterval = setInterval(() => {
      // Create a new raindrop
      this.createRainDrop(container);

      // Remove one of the older drops to manage performance
      if (this.rainDrops.length > this.NUMBER_OF_DROPS) {
        const oldDrop = this.rainDrops.shift();
        if (oldDrop && oldDrop.parentNode) {
          oldDrop.parentNode.removeChild(oldDrop);
        }
      }
    }, 300);
  }

  private createRainDrop(container: HTMLElement): void {
    // Create a raindrop element
    const drop = this.renderer.createElement('div');
    this.renderer.addClass(drop, 'rain-drop');

    // Set random position and animation properties
    const left = Math.random() * 100; // Random horizontal position
    const opacity = 0.2 + Math.random() * 0.4; // Random opacity
    const duration = 0.8 + Math.random() * 1.5; // Random animation duration
    const size = 1 + Math.random() * 2; // Random size

    // Apply styles
    this.renderer.setStyle(drop, 'left', `${left}%`);
    this.renderer.setStyle(drop, 'opacity', opacity.toString());
    this.renderer.setStyle(drop, 'animation-duration', `${duration}s`);
    this.renderer.setStyle(drop, 'width', `${size}px`);
    this.renderer.setStyle(drop, 'height', `${10 + size * 5}px`);

    // Add to container and tracking array
    this.renderer.appendChild(container, drop);
    this.rainDrops.push(drop);

    // Remove drop after animation completes
    setTimeout(() => {
      if (drop.parentNode) {
        drop.parentNode.removeChild(drop);
        const index = this.rainDrops.indexOf(drop);
        if (index !== -1) {
          this.rainDrops.splice(index, 1);
        }
      }
    }, duration * 1000);
  }
}
