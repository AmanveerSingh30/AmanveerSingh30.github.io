import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Heart {
  x: number;
  y: number;
  vy: number;
  vx: number;
  bouncing: boolean;
}

@Component({
  selector: 'app-end-stage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './end-stage.component.html',
  styleUrls: ['./end-stage.component.scss']
})
export class EndStageComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() completed = new EventEmitter<void>();
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number = 0;
  private hearts: Heart[] = [];
  private audio: HTMLAudioElement | null = null;

  // Large heart properties
  private largeHeart = { x: 0, y: 0, size: 110 };
  private mouseX: number = 0;
  private mouseY: number = 0;

  showThankYouMessage = false;
  isMuted = false;

  ngOnInit(): void {
    this.initAudio();
    this.showThankYouMessage = true;
  }

  ngAfterViewInit(): void {
    this.initCanvas();
    this.startAnimation();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  toggleMute(): void {
    if (this.audio) {
      this.isMuted = !this.isMuted;
      this.audio.muted = this.isMuted;
    }
  }

  private initAudio(): void {
    this.audio = new Audio('assets/sounds/elvis-presley-cant-help-falling-in-love-audio.mp3');
    this.audio.loop = true;
    this.audio.volume = 0.3;
    document.addEventListener('click', () => {
      if (this.audio && this.audio.paused) {
        this.audio.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    }, { once: true });
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    this.createHearts(1000); // Increased to 200 hearts
    // Set initial large heart position
    this.largeHeart.x = canvas.width / 2;
    this.largeHeart.y = canvas.height - this.largeHeart.size * 0.7;
  }

  @HostListener('window:resize')
  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private createHearts(count: number): void {
    const canvas = this.canvasRef.nativeElement;
    const centerX = canvas.width / 2;
    const columnWidth = canvas.width * 0.35; // Doubled to 5% of width
    for (let i = 0; i < count; i++) {
      this.hearts.push({
        x: centerX + (Math.random() * columnWidth - columnWidth / 2),
        y: -Math.random() * canvas.height,
        vy: 2.2 + Math.random() * 0.7,
        vx: 0,
        bouncing: false
      });
    }
  }

  private startAnimation(): void {
    const animate = () => {
      const canvas = this.canvasRef.nativeElement;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update large heart position to follow cursor with smooth movement
      this.largeHeart.x += (this.mouseX - this.largeHeart.x) * 0.1;
      this.largeHeart.y += (this.mouseY - this.largeHeart.y) * 0.1;

      this.updateAndDrawHearts();
      this.drawLargeHeart(this.largeHeart.x, this.largeHeart.y, this.largeHeart.size);
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  private updateAndDrawHearts(): void {
    const canvas = this.canvasRef.nativeElement;
    const heartSize = 22;
    for (let i = 0; i < this.hearts.length; i++) {
      const heart = this.hearts[i];
      if (!heart.bouncing) {
        heart.y += heart.vy;
      } else {
        heart.x += heart.vx;
        heart.y += heart.vy;
        heart.vy += 0.18;
        if (heart.y > canvas.height + 40) {
          this.resetHeart(heart, canvas.width, canvas.height);
          continue;
        }
      }

      const dx = heart.x - this.largeHeart.x;
      const dy = heart.y - this.largeHeart.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (!heart.bouncing && dist < this.largeHeart.size * 0.55) {
        heart.bouncing = true;
        heart.vx = dx * 0.13 + (Math.random() - 0.5) * 2.5;
        heart.vy = -Math.abs(heart.vy) * (0.5 + Math.random() * 0.2);
      }

      this.drawHeartEmoji(heart.x, heart.y, heartSize);

      if (heart.y > canvas.height + 40 && !heart.bouncing) {
        this.resetHeart(heart, canvas.width, canvas.height);
      }
    }
  }

  private resetHeart(heart: Heart, width: number, height: number): void {
    const centerX = width / 2;
    const columnWidth = width * 0.35; // Doubled to 5% of width
    heart.x = centerX + (Math.random() * columnWidth - columnWidth / 2);
    heart.y = -20;
    heart.vy = 2.2 + Math.random() * 0.7;
    heart.vx = 0;
    heart.bouncing = false;
  }

  private drawHeartEmoji(x: number, y: number, size: number): void {
    this.ctx.save();
    this.ctx.font = `${size}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
    this.ctx.fillText('❤️', x, y);
    this.ctx.restore();
  }

  private drawLargeHeart(x: number, y: number, size: number): void {
    this.ctx.save();
    this.ctx.font = `${size}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    this.ctx.fillText('❤️', x, y);
    this.ctx.restore();
  }
}
