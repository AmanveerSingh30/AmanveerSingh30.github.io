import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';

@Component({
  selector: 'app-box-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './box-animation.component.html',
  styleUrls: ['./box-animation.component.scss']
})
export class BoxAnimationComponent implements AfterViewInit {
  @Output() animationComplete = new EventEmitter<void>();
  @ViewChild('giftBox') giftBox!: ElementRef;
  @ViewChild('lid') lid!: ElementRef;
  isExploded = false;

  ngAfterViewInit() {
    this.startShakeAnimation();
  }

  startShakeAnimation() {
    gsap.to(this.giftBox.nativeElement, {
      rotation: 5,
      duration: 0.2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });
  }

  onHover() {
    gsap.to(this.lid.nativeElement, {
      y: -20,
      rotation: -10,
      duration: 0.3
    });
  }

  onLeave() {
    gsap.to(this.lid.nativeElement, {
      y: 0,
      rotation: 0,
      duration: 0.3
    });
  }

  onBoxClick() {
    console.log('Box clicked');
    if (this.isExploded) return;
    this.isExploded = true;

    // Stop shaking
    gsap.killTweensOf(this.giftBox.nativeElement);
    console.log('Starting box explosion animation');

    // Explosion animation
    gsap.timeline()
      .to(this.lid.nativeElement, {
        y: -100,
        rotation: -45,
        opacity: 0,
        duration: 0.5,
        onComplete: () => console.log('Lid animation complete')
      })
      .to(this.giftBox.nativeElement, {
        scale: 1.2,
        duration: 0.2,
        onComplete: () => console.log('Box scale up complete')
      })
      .to(this.giftBox.nativeElement, {
        scale: 0,
        rotation: 720,
        opacity: 0,
        duration: 0.5,
        ease: "back.in(1.5)",
        onComplete: () => {
          console.log('Box animation complete, emitting event');
          this.animationComplete.emit();
        }
      });
  }
}
