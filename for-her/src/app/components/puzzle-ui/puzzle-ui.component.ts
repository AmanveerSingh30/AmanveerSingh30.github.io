import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

// Register the Draggable plugin
gsap.registerPlugin(Draggable);

interface PiecePosition {
  x: number;
  y: number;
}

@Component({
  selector: 'app-puzzle-ui',
  imports: [CommonModule],
  templateUrl: './puzzle-ui.component.html',
  styleUrl: './puzzle-ui.component.scss',
  standalone: true
})
export class PuzzleUiComponent implements OnInit, AfterViewInit {
  @ViewChild('puzzleContainer') puzzleContainer!: ElementRef;
  @ViewChild('puzzleBoard') puzzleBoard!: ElementRef;
  @ViewChild('puzzleTarget') puzzleTarget!: ElementRef;
  
  // Puzzle pieces array (0-8)
  pieces: number[] = Array(9).fill(0).map((_, i) => i);
  
  // Define starting positions for puzzle pieces (relative positions around the center)
  startPositions: PiecePosition[] = [
    { x: 0, y: 0 },
    { x: 200, y: 200 },
    { x: 500, y: 500 },
    { x: 1000, y: 1000 },
    { x: -168, y: 39 },
    { x: -33, y: -105 },
    { x: -138, y: -160 },
    { x: -122, y: 71 },
    { x: 91, y: -113 }
  ];
  
  // Track if the puzzle is completed
  puzzleCompleted = false;

  // Store target position coordinates (where pieces should snap to)
  private targetX = 0;
  private targetY = 0;
  
  // Snap threshold
  private snapThreshold = 100;
  
  // Track window resizing
  @HostListener('window:resize')
  onResize() {
    this.calculateTargetPosition();
    this.repositionPieces();
  }

  constructor() {}

  ngOnInit(): void {
    // Set a random background color
    document.body.style.background = `hsl(${Math.random() * 360}, 70%, 80%)`;
  }

  ngAfterViewInit(): void {
    // Wait for view to be fully rendered
    setTimeout(() => {
      this.calculateTargetPosition();
      this.initializePuzzle();
      // Add visual indicator for debugging
      this.addDebugMarker();
    }, 100);
  }

  /**
   * Calculate the position where puzzle pieces should snap to
   * This is the center of the puzzle target area
   */
  calculateTargetPosition(): void {
    if (this.puzzleTarget && this.puzzleContainer) {
      const target = this.puzzleTarget.nativeElement;
      const container = this.puzzleContainer.nativeElement;
      
      // Get the target's position relative to the container
      const targetRect = target.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // Calculate the center point of the target element, relative to the container
      this.targetX = (targetRect.left + targetRect.right) / 2 - containerRect.left;
      this.targetY = (targetRect.top + targetRect.bottom) / 2 - containerRect.top;
      
      console.log('Target position calculated:', { x: this.targetX, y: this.targetY });
    }
  }

  /**
   * Add a visual marker at the target position for debugging
   */
  addDebugMarker(): void {
    const marker = document.createElement('div');
    marker.style.position = 'absolute';
    marker.style.width = '10px';
    marker.style.height = '10px';
    marker.style.borderRadius = '50%';
    marker.style.backgroundColor = 'red';
    marker.style.zIndex = '1000';
    marker.style.transform = 'translate(-50%, -50%)';
    marker.style.left = `${this.targetX}px`;
    marker.style.top = `${this.targetY}px`;
    
    this.puzzleContainer.nativeElement.appendChild(marker);
  }

  /**
   * Reposition all pieces if they've been placed
   */
  repositionPieces(): void {
    // Update already placed pieces
    document.querySelectorAll('.puzzle-piece.placed').forEach(piece => {
      gsap.set(piece, {
        x: this.targetX,
        y: this.targetY
      });
    });
  }

  initializePuzzle(): void {
    const puzzlePieces = document.querySelectorAll('.puzzle-piece');
    
    puzzlePieces.forEach((piece, index) => {
      // Set initial position based on the target center
      const startPos = this.startPositions[index] || { x: 0, y: 0 };
      
      // Position relative to the target position
      gsap.set(piece, {
        x: this.targetX + startPos.x,
        y: this.targetY + startPos.y,
      });
      
      // Make the piece draggable using GSAP
      Draggable.create(piece, {
        type: 'x,y',
        bounds: this.puzzleContainer.nativeElement,
        onPress: () => this.onPiecePress(piece),
        onDragEnd: () => {
          const draggable = Draggable.get(piece) as Draggable;
          this.onPieceRelease(piece, index, draggable);
        }
      });
    });
  }

  onPiecePress(piece: Element): void {
    // Skip if already placed
    if (piece.classList.contains('placed')) return;
    
    // Apply scale effect only - no rotation
    gsap.to(piece, {
      duration: 0.3,
      scale: 1.1,
      zIndex: 100,
      ease: 'back.out(3)'
    });

    // Ensure clicked piece is on top by moving it to end of container
    piece.parentElement?.appendChild(piece);
  }

  onPieceRelease(piece: Element, index: number, draggable: Draggable): void {
    // Skip if already placed
    if (piece.classList.contains('placed')) return;
    
    // Reset scale
    gsap.to(piece, {
      duration: 0.2,
      scale: 1,
      ease: 'back.out(3)'
    });

    // Calculate distance to target position
    const dx = draggable.x - this.targetX;
    const dy = draggable.y - this.targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Debug distance
    console.log(`Piece ${index} distance from target: ${distance.toFixed(2)} (threshold: ${this.snapThreshold})`);
    console.log(`Piece position: (${draggable.x.toFixed(2)}, ${draggable.y.toFixed(2)}), Target: (${this.targetX.toFixed(2)}, ${this.targetY.toFixed(2)})`);
    
    // Check if piece is close to correct position - increased threshold for better snapping
    if (distance < this.snapThreshold) {
      // Snap to correct position
      gsap.to(piece, {
        duration: 0.3,
        x: this.targetX,
        y: this.targetY,
        onComplete: () => {
          // Set this piece to "placed" after animation completes
          draggable.disable();
          piece.classList.add('placed');
          
          // Check if puzzle is complete
          this.checkPuzzleCompletion();
        }
      });
    }
  }

  checkPuzzleCompletion(): void {
    const placedPieces = document.querySelectorAll('.puzzle-piece.placed');
    
    if (placedPieces.length === this.pieces.length) {
      this.puzzleCompleted = true;
      
      // Show the complete image with animation
      const completeImage = document.querySelector('.complete-image');
      if (completeImage) {
        gsap.to(completeImage, {
          duration: 1,
          opacity: 1,
          ease: 'power2.inOut'
        });
      }
    }
  }
}
