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
  private mousePosition = { x: 0, y: 0 };
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
    // Update mouse position for the large heart to follow
    this.mousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  }
  
  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    // Handle touch events for mobile devices
    if (event.touches.length > 0) {
      this.mousePosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
      
      // Prevent scrolling while interacting with the canvas
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
    this.audio.volume = 0.5;
    
    // Play audio with user interaction to comply with autoplay policies
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
    
    // Set canvas size to match window size
    this.resizeCanvas();
    
    // Create initial hearts
    this.createHearts(15);
    
    // Set initial mouse position to center of screen
    this.mousePosition = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
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
    const spreadRange = canvas.width * 0.2; // 20% of canvas width for spawn area
    
    for (let i = 0; i < count; i++) {
      // Create hearts within the narrow vertical area
      const heartX = centerX + (Math.random() * spreadRange - spreadRange / 2);
      
      this.hearts.push({
        x: heartX,
        y: -50, // Start above the canvas
        size: Math.random() * 20 + 10, // 10-30px
        speed: Math.random() * 1 + 0.5, // 0.5-1.5 speed
        opacity: Math.random() * 0.5 + 0.5, // 0.5-1.0 opacity
        color: this.getRandomHeartColor(),
        rotation: Math.random() * Math.PI * 2, // Random initial rotation
        rotationSpeed: (Math.random() - 0.5) * 0.02 // Rotation speed
      });
    }
  }
  
  private getRandomHeartColor(): string {
    const colors = [
      '#FF9AA2', // Light pink
      '#FFBBBB', // Pink
      '#FFCCCC', // Light pink
      '#FF6B6B', // Dark pink
      '#FF8080', // Medium pink
      '#FAA0A0', // Salmon pink
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  private startAnimation(): void {
    const animate = () => {
      const canvas = this.canvasRef.nativeElement;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw falling hearts
      this.updateAndDrawHearts();
      
      // Draw large heart following mouse
      this.drawLargeHeart(this.mousePosition.x, this.mousePosition.y, 40);
      
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  private updateAndDrawHearts(): void {
    const canvas = this.canvasRef.nativeElement;
    
    // Update and draw each heart
    for (let i = 0; i < this.hearts.length; i++) {
      const heart = this.hearts[i];
      
      // Update position
      heart.y += heart.speed;
      heart.rotation += heart.rotationSpeed;
      
      // Check collision with large heart
      const distToMouse = Math.sqrt(
        Math.pow(heart.x - this.mousePosition.x, 2) +
        Math.pow(heart.y - this.mousePosition.y, 2)
      );
      
      // If collision with large heart, bounce
      if (distToMouse < 40 + heart.size / 2) {
        // Calculate bounce vector
        const dx = heart.x - this.mousePosition.x;
        const dy = heart.y - this.mousePosition.y;
        const norm = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize and apply bounce
        if (norm > 0) {
          heart.x += (dx / norm) * 2;
          heart.y += (dy / norm) * 2;
          
          // Change direction slightly
          heart.rotation += Math.random() * 0.2 - 0.1;
        }
      }
      
      // Draw the heart
      this.drawHeart(heart.x, heart.y, heart.size, heart.color, heart.opacity, heart.rotation);
      
      // Reset heart if it goes out of bounds
      if (heart.y > canvas.height + 50) {
        heart.y = -50;
        heart.x = canvas.width / 2 + (Math.random() * canvas.width * 0.2 - canvas.width * 0.1);
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
      -size / 2, -size / 2, 
      -size, 0, 
      0, size
    );
    
    // Right curve
    this.ctx.bezierCurveTo(
      size, 0, 
      size / 2, -size / 2, 
      0, size / 4
    );
    
    this.ctx.closePath();
    this.ctx.fill();
    
    // Add subtle glow effect
    if (size > 20) {
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 10;
    }
    
    // Restore context
    this.ctx.restore();
  }
  
  private drawLargeHeart(x: number, y: number, size: number): void {
    // Draw the large heart with a stronger glow effect
    this.ctx.save();
    
    // Apply shadow for glow effect
    this.ctx.shadowColor = '#FF6B6B';
    this.ctx.shadowBlur = 20;
    
    // Draw large heart
    this.drawHeart(x, y, size, '#FF4D6D', 0.9, 0);
    
    this.ctx.restore();
  }
} 