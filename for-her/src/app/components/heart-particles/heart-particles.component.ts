import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'app-heart-particles',
  standalone: true,
  imports: [],
  templateUrl: './heart-particles.component.html',
  styleUrl: './heart-particles.component.scss'
})
export class HeartParticlesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heartCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  // Configurable parameters
  @Input() particleCount = 32;
  @Input() particleSize = 10;
  @Input() speed = 1;
  @Input() colorScheme: 'rainbow' | 'red' | 'green' | 'blue' | 'monochrome' = 'rainbow';
  @Input() mouseInfluence = 50;
  
  // Canvas variables
  private ctx!: CanvasRenderingContext2D;
  private canvasWidth = 0;
  private canvasHeight = 0;
  
  // Animation state
  private trails: any[] = [];
  private heartPath: number[][] = [];
  private mouseX = 0;
  private mouseY = 0;
  private mouseActive = false;
  private animationRunning = false;
  private animationFrameId: number | null = null;
  
  ngAfterViewInit(): void {
    this.initCanvas();
    this.initHeartPath();
    this.initParticles();
    this.startAnimation();
  }
  
  ngOnDestroy(): void {
    this.stopAnimation();
  }
  
  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.canvasWidth = canvas.width = window.innerWidth;
    this.canvasHeight = canvas.height = window.innerHeight;
  }
  
  private initHeartPath(): void {
    this.heartPath = [];
    const PI2 = 6.28318; // 2*PI approximation
    const steps = Math.max(32, this.particleCount);
    
    // Calculate heart center and scale based on container dimensions
    // Center heart vertically but shifted to the left side
    const centerX = this.canvasWidth * 0.15; // Centered within left 30% of screen
    const centerY = this.canvasHeight * 0.5;
    const scale = Math.min(this.canvasWidth, this.canvasHeight) * 0.15; // Smaller scale for side view
    
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * PI2;
      this.heartPath.push([
        centerX + scale * Math.pow(Math.sin(t), 3),
        centerY + scale * 0.1 * (-(15 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)))
      ]);
    }
  }
  
  private initParticles(): void {
    this.trails = [];
    if (this.heartPath.length === 0) this.initHeartPath();

    for (let i = 0; i < this.particleCount; i++) {
      const particles: any[] = [];
      const x = Math.random() * this.canvasWidth * 0.3; // Initialize in left 30% of screen
      const y = Math.random() * this.canvasHeight;

      for (let k = 0; k < this.particleCount; k++) {
        // Color generation - more vibrant for side display
        let hue: number, saturation = Math.random() * 30 + 70; // More saturated
        let brightness = Math.random() * 50 + 50; // Brighter
        let opacity = Math.random() * 0.3 + 0.2; // More opaque
        
        switch(this.colorScheme) {
          case 'red': hue = Math.random() * 20 + 350; break;
          case 'blue': hue = Math.random() * 20 + 200; break;
          case 'green': hue = Math.random() * 20 + 100; break;
          case 'monochrome': hue = 0; saturation = 0; brightness = 90; break;
          default: hue = i/this.particleCount * 360; // rainbow
        }

        particles.push({
          x, y,
          velX: 0, velY: 0,
          radius: ((1 - k/this.particleCount) + 1) * this.particleSize/2,
          speed: Math.random() + 1,
          targetIndex: Math.floor(Math.random() * this.heartPath.length),
          direction: i % 2 * 2 - 1,
          friction: Math.random() * 0.2 + 0.7,
          color: `hsla(${hue},${saturation}%,${brightness}%,${opacity})`
        });
      }
      this.trails.push(particles);
    }
  }
  
  private renderParticle(particle: any): void {
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  private animationLoop(): void {
    if (!this.animationRunning) return;

    try {
      // Clear with trail effect - use more transparent background for left side display
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      this.trails.forEach(trail => {
        if (!trail || !trail.length) return;
        
        const leader = trail[0];
        const target = this.heartPath[leader.targetIndex % this.heartPath.length];
        if (!target) return;

        // Mouse influence - stronger for left side display
        if (this.mouseActive && this.mouseInfluence > 0) {
          const dx = this.mouseX - leader.x;
          const dy = this.mouseY - leader.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist < 300) {
            const force = (1 - dist/300) * (this.mouseInfluence/20);
            leader.velX += dx/dist * force;
            leader.velY += dy/dist * force;
          }
        }

        // Move toward target
        const dx = leader.x - target[0];
        const dy = leader.y - target[1];
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < 10) {
          if (Math.random() > 0.95) {
            leader.targetIndex = Math.floor(Math.random() * this.heartPath.length);
          } else {
            if (Math.random() > 0.99) leader.direction *= -1;
            leader.targetIndex += leader.direction;
            leader.targetIndex = (leader.targetIndex + this.heartPath.length) % this.heartPath.length;
          }
        }

        // Update physics
        leader.velX += -dx/dist * leader.speed * this.speed;
        leader.velY += -dy/dist * leader.speed * this.speed;
        leader.x += leader.velX;
        leader.y += leader.velY;
        leader.velX *= leader.friction;
        leader.velY *= leader.friction;

        // Render trail
        this.renderParticle(leader);
        for (let k = 1; k < trail.length; k++) {
          trail[k].x -= (trail[k].x - trail[k-1].x) * 0.7;
          trail[k].y -= (trail[k].y - trail[k-1].y) * 0.7;
          this.renderParticle(trail[k]);
        }
      });
    } catch (error) {
      console.error("Animation error:", error);
    }

    this.animationFrameId = requestAnimationFrame(() => this.animationLoop());
  }
  
  private startAnimation(): void {
    this.animationRunning = true;
    this.animationFrameId = requestAnimationFrame(() => this.animationLoop());
  }
  
  private stopAnimation(): void {
    this.animationRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  @HostListener('window:resize')
  onResize(): void {
    this.canvasWidth = this.canvasRef.nativeElement.width = window.innerWidth;
    this.canvasHeight = this.canvasRef.nativeElement.height = window.innerHeight;
    this.initHeartPath();
  }
  
  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    this.mouseActive = true;
  }
  
  @HostListener('window:mouseleave')
  onMouseLeave(): void {
    this.mouseActive = false;
  }
}
