import { Component, OnInit, Input, Output, EventEmitter, ElementRef, OnDestroy, Renderer2, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil, interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { Emoji } from '../../models/emoji.model';
import { animationConfig, viewportPadding } from '../../data/emoji-config';

@Component({
  selector: 'app-floating-emoji',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div 
      *ngIf="!emoji.collected"
      class="floating-emoji" 
      [style.left.px]="position.x" 
      [style.top.px]="position.y"
      [style.fontSize.px]="size"
      (click)="onEmojiClick()">
      {{ emoji.type }}
    </div>
  `,
  styles: [`
    .floating-emoji {
      position: absolute;
      cursor: pointer;
      user-select: none;
      transition: transform 0.2s ease;
      will-change: transform, left, top;
      z-index: 10;
    }
    
    .floating-emoji:hover {
      transform: scale(1.2);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FloatingEmojiComponent implements OnInit, OnDestroy {
  @Input() emoji!: Emoji;
  @Input() containerSize!: { width: number, height: number };
  @Input() isPaused: boolean = false;
  @Output() collected = new EventEmitter<string>();
  
  position = { x: 0, y: 0 };
  velocity = { x: 0, y: 0 };
  size = 40;
  
  private destroy$ = new Subject<void>();
  private animationSubscription: Subscription | null = null;
  
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.initializePosition();
    this.startAnimation();
  }
  
  ngOnDestroy(): void {
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
    // Generate random size
    this.size = Math.floor(Math.random() * 
      (animationConfig.maxSize - animationConfig.minSize) + 
      animationConfig.minSize);
    
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
    
    // Update emoji data with initialized values
    if (this.emoji) {
      this.emoji.position = { ...this.position };
      this.emoji.velocity = { ...this.velocity };
    }
    
    this.cd.detectChanges();
  }
  
  /**
   * Start the floating animation
   */
  private startAnimation(): void {
    this.animationSubscription = interval(animationConfig.updateInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.isPaused && !this.emoji.collected) {
          this.updatePosition();
        }
      });
  }
  
  /**
   * Update emoji position based on velocity and bounce off edges
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
    
    // Update emoji data
    if (this.emoji) {
      this.emoji.position = { ...this.position };
      this.emoji.velocity = { ...this.velocity };
    }
    
    this.cd.detectChanges();
  }
  
  /**
   * Handle emoji click
   */
  onEmojiClick(): void {
    if (!this.emoji.collected) {
      this.collected.emit(this.emoji.id);
    }
  }
} 