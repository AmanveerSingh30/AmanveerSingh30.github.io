import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';

@Component({
  selector: 'app-letter-opening',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './letter-opening.component.html',
  styleUrl: './letter-opening.component.scss'
})
export class LetterOpeningComponent {
  @Output() opened = new EventEmitter<void>();

  isOpen = false;
  isVisible = true;

  onOpenClick(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    
    // Use GSAP to ensure the flap opens properly with 3D rotation
    gsap.to('.flap', {
      rotationX: 180,
      duration: 0.4,
      ease: 'power2.inOut'
    });

    // After a delay, animate the letter coming up
    gsap.to('.letter', {
      y: -60,
      duration: 0.4,
      delay: 0.4,
      ease: 'back.out(1.2)',
      onComplete: () => {
        // Animate hearts after letter is up
        this.animateHearts();
      }
    });
    
    // Don't emit the completed event automatically
    // We'll let the user see the animation and then click Reset
  }

  onResetClick(): void {
    // Fade out the entire envelope
    gsap.to('#envelope', {
      opacity: 0,
      duration: 0.8,
      onComplete: () => {
        // After fade out, emit the opened event to proceed
        this.opened.emit();
        
        // Hide the envelope
        this.isVisible = false;
      }
    });
    
    // Reset hearts immediately
    gsap.set('.heart', { opacity: 0, y: 0, x: 0 });
  }

  private animateHearts(): void {
    // Make hearts visible first
    gsap.set('.heart', { opacity: 1 });
    
    // Animate hearts with different paths and timings
    gsap.to('.heart.a1', {
      y: '-=600', 
      x: '+=50', 
      duration: 4, 
      ease: 'none',
      opacity: 0.8
    });
    
    gsap.to('.heart.a2', {
      y: '-=600', 
      x: '+=30', 
      duration: 5, 
      ease: 'none',
      opacity: 0.8,
      delay: 0.3
    });
    
    gsap.to('.heart.a3', {
      y: '-=600', 
      x: '+=70', 
      duration: 7, 
      ease: 'none',
      opacity: 0.8,
      delay: 0.5
    });
  }
}
