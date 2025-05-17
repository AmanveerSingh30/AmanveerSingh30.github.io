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

  onOpenClick(): void {
    if (this.isOpen) return;
    this.isOpen = true;

    // Emit the opened event
    setTimeout(() => {
      this.opened.emit();
    }, 1000);
    
    // Let the CSS handle most of the animation
    // GSAP is used for the hearts animation
    setTimeout(() => {
      this.animateHearts();
    }, 700);
  }

  onResetClick(): void {
    this.isOpen = false;
    
    // The CSS transitions will handle the envelope animations
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
