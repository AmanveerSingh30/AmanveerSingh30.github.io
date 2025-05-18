import { Component, OnInit, Input, Output, EventEmitter, ElementRef, OnDestroy, Renderer2, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil, interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

import { Heart } from '../../models/heart.model';
import { animationConfig, viewportPadding } from '../../data/heart-config';

@Component({
  selector: 'app-floating-heart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="!heart.collected"
      class="floating-heart" 
      [style.left.px]="position.x" 
      [style.top.px]="position.y"
      [style.width.px]="size"
      [style.height.px]="size"
      (click)="onHeartClick()">
      <div class="heart-shape">
        <div class="image-container">
          <img [src]="heart.image" alt="Heart image" class="heart-image" onerror="this.src='assets/memories/1.jpg'" />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .floating-heart {
      position: absolute;
      cursor: pointer;
      user-select: none;
      transition: transform 0.2s ease;
      will-change: transform, left, top;
      z-index: 100;
      border: 2px solid white;
      box-shadow: 0 0 15px rgba(255, 105, 180, 0.8);
      border-radius: 10px;
    }
    
    .floating-heart:hover {
      transform: scale(1.1);
      box-shadow: 0 0 20px rgba(255, 20, 147, 0.9);
    }

    .heart-shape {
      width: 100%;
      height: 100%;
      background-color: #FF69B4;
      transform: rotate(-45deg);
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 10%;
    }

    .heart-shape:before,
    .heart-shape:after {
      content: '';
      background-color: #FF69B4;
      border-radius: 50%;
      position: absolute;
      width: 50%;
      height: 50%;
    }

    .heart-shape:before {
      top: -25%;
      left: 0;
    }

    .heart-shape:after {
      top: 0;
      right: -25%;
    }

    .image-container {
      width: 70%;
      height: 70%;
      position: relative;
      z-index: 2;
      transform: rotate(45deg);
      overflow: hidden;
      border-radius: 4px;
    }

    .heart-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    @keyframes pop {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      25% {
        transform: scale(1.3);
        opacity: 0.9;
      }
      50% {
        transform: scale(1.5);
        opacity: 0.7;
      }
      75% {
        transform: scale(1.2);
        opacity: 0.5;
      }
      100% {
        transform: scale(0);
        opacity: 0;
      }
    }

    .pop-animation {
      animation: pop 0.3s ease-out forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FloatingHeartComponent implements OnInit, OnDestroy {
  @Input() heart!: Heart;
  @Input() containerSize!: { width: number, height: number };
  @Input() isPaused: boolean = false;
  @Output() collected = new EventEmitter<string>();
  
  position = { x: 0, y: 0 };
  velocity = { x: 0, y: 0 };
  size = 60; // Making hearts bigger
  
  private destroy$ = new Subject<void>();
  private animationSubscription: Subscription | null = null;
  
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef
  ) {
    console.log('FloatingHeartComponent initialized');
  }
  
  ngOnInit(): void {
    console.log('FloatingHeartComponent ngOnInit for heart:', this.heart.id);
    this.initializePosition();
    this.startAnimation();
    console.log('Heart image path:', this.heart.image);
  }
  
  ngOnDestroy(): void {
    console.log('FloatingHeartComponent destroyed for heart:', this.heart.id);
    this.destroy$.next();
    this.destroy$.complete();
    if (this.animationSubscription) {
      this.animationSubscription.unsubscribe();
    }
  }
  
  /**
   * Initialize random position and velocity
   */
  private initializePosition(): void {
    // Generate random size (make them bigger)
    this.size = Math.floor(Math.random() * 
      (animationConfig.maxSize - animationConfig.minSize) + 
      animationConfig.minSize) + 20;
    
    // Generate random position within container
    this.position = {
      x: Math.random() * (this.containerSize.width - this.size - viewportPadding * 2) + viewportPadding,
      y: Math.random() * (this.containerSize.height - this.size - viewportPadding * 2) + viewportPadding
    };
    
    // Generate random velocity
    const speed = Math.random() * 
      (animationConfig.maxSpeed - animationConfig.minSpeed) + 
      animationConfig.minSpeed;
    const angle = Math.random() * Math.PI * 2;
    
    this.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };
    
    // Update heart data with initialized values
    if (this.heart) {
      this.heart.position = { ...this.position };
      this.heart.velocity = { ...this.velocity };
    }
    
    console.log(`Heart ${this.heart.id} positioned at:`, this.position);
    this.cd.detectChanges();
  }
  
  /**
   * Start the floating animation
   */
  private startAnimation(): void {
    console.log(`Starting animation for heart ${this.heart.id}`);
    this.animationSubscription = interval(animationConfig.updateInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.isPaused && !this.heart.collected) {
          this.updatePosition();
        }
      });
  }
  
  /**
   * Update heart position based on velocity and bounce off edges
   */
  private updatePosition(): void {
    // Update position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    
    // Check boundaries and bounce
    const minX = viewportPadding;
    const maxX = this.containerSize.width - this.size - viewportPadding;
    const minY = viewportPadding;
    const maxY = this.containerSize.height - this.size - viewportPadding;
    
    // Bounce off right/left edges
    if (this.position.x > maxX) {
      this.position.x = maxX;
      this.velocity.x = -this.velocity.x * animationConfig.bounceRatio;
    } else if (this.position.x < minX) {
      this.position.x = minX;
      this.velocity.x = -this.velocity.x * animationConfig.bounceRatio;
    }
    
    // Bounce off bottom/top edges
    if (this.position.y > maxY) {
      this.position.y = maxY;
      this.velocity.y = -this.velocity.y * animationConfig.bounceRatio;
    } else if (this.position.y < minY) {
      this.position.y = minY;
      this.velocity.y = -this.velocity.y * animationConfig.bounceRatio;
    }
    
    // Apply a tiny random adjustment to prevent patterns
    if (Math.random() < 0.05) {
      this.velocity.x += (Math.random() - 0.5) * 0.2;
      this.velocity.y += (Math.random() - 0.5) * 0.2;
    }
    
    // Update heart data
    if (this.heart) {
      this.heart.position = { ...this.position };
      this.heart.velocity = { ...this.velocity };
    }
    
    this.cd.detectChanges();
  }
  
  /**
   * Handle heart click
   */
  onHeartClick(): void {
    console.log(`Heart ${this.heart.id} clicked`);
    if (!this.heart.collected) {
      // Play pop animation here (adding CSS class triggered animation)
      const element = this.el.nativeElement.querySelector('.floating-heart');
      if (element) {
        this.renderer.addClass(element, 'pop-animation');
        // Remove class after animation finishes (animation duration is typically around 500ms)
        setTimeout(() => {
          this.collected.emit(this.heart.id);
        }, 300);
      } else {
        this.collected.emit(this.heart.id);
      }
    }
  }
} 