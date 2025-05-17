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
  hasBeenOpened = false;

  onOpenClick(): void {
    if (this.hasBeenOpened) return;
    this.isOpen = true;
    this.hasBeenOpened = true;

    // Animate the letter opening
    gsap.timeline()
      .to('.flap', {
        rotationX: 180,
        duration: 0.4,
        ease: 'power2.inOut'
      })
      .to('.letter', {
        y: -60,
        duration: 0.4,
        ease: 'back.out(1.2)',
        onComplete: () => {
          this.opened.emit();
          this.animateHearts();
        }
      }, '-=0.2');
  }

  onResetClick(): void {
    this.isOpen = false;
    gsap.timeline()
      .to('.letter', {
        y: 0,
        duration: 0.4,
        ease: 'power2.inOut'
      })
      .to('.flap', {
        rotationX: 0,
        duration: 0.4,
        ease: 'power2.inOut'
      }, '-=0.2')
      .set('.heart', { opacity: 0 });
  }

  private animateHearts(): void {
    // Animate each heart with different paths and timings
    gsap.timeline()
      .set('.heart', { opacity: 1 })
      .to('.heart.a1', {
        y: '-=600',
        x: '+=50',
        duration: 4,
        ease: 'none'
      })
      .to('.heart.a2', {
        y: '-=600',
        x: '+=50',
        duration: 5,
        ease: 'none'
      }, '-=4')
      .to('.heart.a3', {
        y: '-=600',
        x: '+=50',
        duration: 7,
        ease: 'none'
      }, '-=5');
  }
}
