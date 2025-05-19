import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Heart {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
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
  // Large heart follows mouse with easing
  private largeHeart = { x: 0, y: 0, targetX: 0, targetY: 0 };
  private audio: HTMLAudioElement | null = null;
  
  showThankYouMessage = false;
  isMuted = false;
  
  ngOnInit(): void {
    // Create audio element
    this.initAudio();
    
    // Show thank you message after a delay
    setTimeout(() => {
      this.showThankYouMessage = true;
    }, 3000);
  }
  
  ngAfterViewInit(): void {
    this.initCanvas();
    this.startAnimation();
  }
  
  ngOnDestroy(): void {
    // Cancel animation frame when component is destroyed
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Stop audio
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }
  
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    // Update target position for the large heart to follow
    this.largeHeart.targetX = event.clientX;
    this.largeHeart.targetY = event.clientY;
  }
  
  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    // Handle touch events for mobile devices
    if (event.touches.length > 0) {
      this.largeHeart.targetX = event.touches[0].clientX;
      this.largeHeart.targetY = event.touches[0].clientY;
      event.preventDefault();
    }
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
    this.audio.volume = 0.3; // Reduced volume for softer background music
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
    this.createHearts(15);
    // Set initial large heart position to center
    this.largeHeart.x = window.innerWidth / 2;
    this.largeHeart.y = window.innerHeight / 2;
    this.largeHeart.targetX = this.largeHeart.x;
    this.largeHeart.targetY = this.largeHeart.y;
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
    const spreadRange = canvas.width * 0.08; // 8% of canvas width for a narrow strip
    for (let i = 0; i < count; i++) {
      const heartX = centerX + (Math.random() * spreadRange - spreadRange / 2);
      this.hearts.push({
        x: heartX,
        y: -50,
        size: Math.random() * 20 + 10,
        speed: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.5 + 0.5,
        color: this.getRandomHeartColor(),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      });
    }
  }
  
  private getRandomHeartColor(): string {
    const colors = [
      '#FF9AA2', '#FFBBBB', '#FFCCCC', '#FF6B6B', '#FF8080', '#FAA0A0',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  private startAnimation(): void {
    const animate = () => {
      const canvas = this.canvasRef.nativeElement;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Easing for large heart
      const ease = 0.12;
      this.largeHeart.x += (this.largeHeart.targetX - this.largeHeart.x) * ease;
      this.largeHeart.y += (this.largeHeart.targetY - this.largeHeart.y) * ease;
      // Draw falling hearts
      this.updateAndDrawHearts();
      // Draw large heart following mouse
      this.drawLargeHeart(this.largeHeart.x, this.largeHeart.y, 48);
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }
  
  private updateAndDrawHearts(): void {
    const canvas = this.canvasRef.nativeElement;
    const largeHeartSize = 48;
    for (let i = 0; i < this.hearts.length; i++) {
      const heart = this.hearts[i];
      heart.y += heart.speed;
      heart.rotation += heart.rotationSpeed;
      // Bounce physics with large heart
      const dx = heart.x - this.largeHeart.x;
      const dy = heart.y - this.largeHeart.y;
      const distToLargeHeart = Math.sqrt(dx * dx + dy * dy);
      if (distToLargeHeart < largeHeartSize + heart.size / 2) {
        // Stronger bounce
        const angle = Math.atan2(dy, dx);
        const bounceStrength = 4 + Math.random() * 2;
        heart.x += Math.cos(angle) * bounceStrength;
        heart.y += Math.sin(angle) * bounceStrength;
        // Optional: add a little pop
        heart.opacity = Math.min(1, heart.opacity + 0.1);
      }
      this.drawHeart(heart.x, heart.y, heart.size, heart.color, heart.opacity, heart.rotation);
      // Reset heart if it goes out of bounds (narrow band)
      if (heart.y > canvas.height + 50) {
        const centerX = canvas.width / 2;
        const spreadRange = canvas.width * 0.08;
        heart.y = -50;
        heart.x = centerX + (Math.random() * spreadRange - spreadRange / 2);
      }
    }
    // Add new hearts occasionally
    if (Math.random() < 0.02 && this.hearts.length < 30) {
      this.createHearts(1);
    }
  }
  
  private drawHeart(x: number, y: number, size: number, color: string, opacity: number, rotation: number): void {
    // Save current context state
    this.ctx.save();
    
    // Move to the heart's position
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);
    
    // Set drawing styles
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = opacity;
    
    // Create heart path
    this.ctx.beginPath();
    this.ctx.moveTo(0, size / 4);
    
    // Left curve
    this.ctx.bezierCurveTo(
      -size / 2, -size / 4,
      -size / 2, -size / 2,
      0, -size / 2
    );
    
    // Right curve
    this.ctx.bezierCurveTo(
      size / 2, -size / 2,
      size / 2, -size / 4,
      0, size / 4
    );
    
    // Fill the heart
    this.ctx.fill();
    
    // Restore context state
    this.ctx.restore();
  }
  
  private drawLargeHeart(x: number, y: number, size: number): void {
    // Save current context state
    this.ctx.save();
    
    // Move to the heart's position
    this.ctx.translate(x, y);
    
    // Add glow effect
    this.ctx.shadowColor = '#FF69B4';
    this.ctx.shadowBlur = 15;
    
    // Set drawing styles
    this.ctx.fillStyle = '#FF69B4';
    this.ctx.globalAlpha = 0.8;
    
    // Create heart path
    this.ctx.beginPath();
    this.ctx.moveTo(0, size / 4);
    
    // Left curve
    this.ctx.bezierCurveTo(
      -size / 2, -size / 4,
      -size / 2, -size / 2,
      0, -size / 2
    );
    
    // Right curve
    this.ctx.bezierCurveTo(
      size / 2, -size / 2,
      size / 2, -size / 4,
      0, size / 4
    );
    
    // Fill the heart
    this.ctx.fill();
    
    // Restore context state
    this.ctx.restore();
  }
} 