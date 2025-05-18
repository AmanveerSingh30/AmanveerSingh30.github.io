import { Component, OnInit, OnDestroy, EventEmitter, Output, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Subscription } from 'rxjs';
import { HeartTrackerComponent } from '../../heart-stage-helper/components/heart-tracker/heart-tracker.component';
import { FloatingHeartComponent } from '../../heart-stage-helper/components/floating-heart/floating-heart.component';
import { Heart } from '../../heart-stage-helper/models/heart.model';
import { HeartService } from '../../heart-stage-helper/services/heart.service';

@Component({
  selector: 'app-heart-stage',
  standalone: true,
  imports: [
    CommonModule,
    FloatingHeartComponent,
    HeartTrackerComponent
  ],
  template: `
    <div class="heart-stage" #stageContainer>
      <!-- ILY dribble gif in bottom left corner with triple click to skip -->
      <div class="ily-dribble-container" (click)="handleIlyClick($event)">
        <img src="assets/ily_dribble.gif" alt="ILY Dribble" class="ily-dribble-gif">
      </div>

      <div class="hearts-container">
        <!-- Floating hearts -->
        <app-floating-heart
          *ngFor="let heart of hearts"
          [heart]="heart"
          [containerSize]="containerSize"
          [isPaused]="animationPaused"
          (collected)="onHeartCollected($event)">
        </app-floating-heart>
      </div>

      <!-- Heart tracker (top-right corner) -->
      <app-heart-tracker></app-heart-tracker>

      <!-- Stage completion message -->
      <div class="completion-message" *ngIf="stageCompleted">
        <h2>All Hearts Collected!</h2>
        <button class="next-stage-button" (click)="onNextStage()">Continue to Next Stage</button>
      </div>

      <!-- Debug controls (only visible with ?debug=true in URL) -->
      <div class="debug-panel" *ngIf="showDebugPanel">
        <h4>Debug Controls</h4>
        <div class="debug-buttons">
          <button (click)="debugShowState()">Show State</button>
          <button (click)="resetStage()">Reset</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .heart-stage {
      position: relative;
      width: 100%;
      height: 100vh;
      background: linear-gradient(to bottom, #f7cac9, #f7e5e4);
      overflow: hidden;
    }
    
    .hearts-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 50;
    }
    
    .ily-dribble-container {
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 200;
      cursor: pointer;
    }
    
    .ily-dribble-gif {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }
    
    .completion-message {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      padding: 30px;
      border-radius: 15px;
      text-align: center;
      z-index: 300;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    
    h2 {
      color: #FF1493;
      margin-top: 0;
      margin-bottom: 20px;
    }
    
    .next-stage-button {
      background: linear-gradient(135deg, #FF1493, #FF69B4);
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 30px;
      cursor: pointer;
      font-weight: bold;
      box-shadow: 0 4px 10px rgba(255, 20, 147, 0.3);
      transition: all 0.3s ease;
    }
    
    .next-stage-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(255, 20, 147, 0.4);
    }
    
    .debug-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px;
      border-radius: 5px;
      z-index: 1000;
    }
    
    .debug-buttons {
      display: flex;
      gap: 5px;
    }
    
    .debug-buttons button {
      background: #333;
      color: white;
      border: 1px solid #555;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    }
  `]
})
export class HeartStageComponent implements OnInit, OnDestroy {
  @Output() completed = new EventEmitter<void>();

  hearts: Heart[] = [];
  containerSize = { width: 0, height: 0 };
  animationPaused = false;
  stageCompleted = false;
  showDebugPanel = false;

  private subscriptions: Subscription[] = [];

  private clickCount = 0;
  private lastClickTime = 0;

  constructor(
    private heartService: HeartService,
    private cd: ChangeDetectorRef
  ) {
    console.log('HeartStageComponent initialized');

    // Check if debug mode is enabled via URL parameter
    this.showDebugPanel = window.location.search.includes('debug=true');
  }

  ngOnInit(): void {
    console.log('HeartStageComponent ngOnInit');

    // Update container size initially and on window resize
    this.updateContainerSize();

    // Subscribe to hearts
    const heartsSub = this.heartService.hearts$.subscribe(hearts => {
      console.log('Received hearts:', hearts.length);
      this.hearts = hearts;
      
      // Debug log each heart
      hearts.forEach(heart => {
        console.log('Heart ID:', heart.id, 'Image:', heart.image);
      });
      
      this.cd.detectChanges();
    }, error => {
      console.error('Error in hearts subscription:', error);
    });
    this.subscriptions.push(heartsSub);

    // Subscribe to animation paused state
    const pausedSub = this.heartService.animationPaused$.subscribe(paused => {
      console.log('Animation paused state:', paused);
      this.animationPaused = paused;
      this.cd.detectChanges();
    }, error => {
      console.error('Error in paused subscription:', error);
    });
    this.subscriptions.push(pausedSub);

    // Subscribe to stage completion
    const completionSub = this.heartService.heartCollection$.subscribe(collection => {
      console.log('Heart collection state:', collection);
      this.stageCompleted = collection.completed;
      
      if (collection.completed) {
        console.log('All hearts collected - stage completed!');
        this.heartService.pauseAnimation(true);
      }
      
      this.cd.detectChanges();
    }, error => {
      console.error('Error in completion subscription:', error);
    });
    this.subscriptions.push(completionSub);
  }

  ngOnDestroy(): void {
    console.log('HeartStageComponent destroyed');
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Update container size on window resize
   */
  @HostListener('window:resize')
  onResize(): void {
    this.updateContainerSize();
  }

  /**
   * Update container size based on window dimensions
   */
  private updateContainerSize(): void {
    this.containerSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    console.log('Container size updated:', this.containerSize);
    this.cd.detectChanges();
  }

  /**
   * Handle heart collection
   */
  onHeartCollected(heartId: string): void {
    console.log('Heart collected:', heartId);
    this.heartService.collectHeart(heartId);
  }

  /**
   * Handle next stage click
   */
  onNextStage(): void {
    console.log('Next stage button clicked');
    this.completed.emit();
  }

  /**
   * Reset the heart stage (for testing/debugging)
   */
  resetStage(): void {
    console.log('Resetting heart stage');
    this.heartService.resetStage();
  }

  /**
   * Debug function to show current state
   */
  debugShowState(): void {
    console.log('=== HEART STAGE DEBUG STATE ===');
    console.log('Hearts:', this.hearts);
    console.log('Animation paused:', this.animationPaused);
    console.log('Stage completed:', this.stageCompleted);
    console.log('Container size:', this.containerSize);

    // Access current state from service
    this.heartService.hearts$.subscribe(hearts =>
      console.log('Service hearts:', hearts));
    this.heartService.heartCollection$.subscribe(collection =>
      console.log('Service heart collection:', collection));
  }

  handleIlyClick(event: MouseEvent): void {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - this.lastClickTime;

    // Reset click count if more than 500ms between clicks
    if (timeDiff > 500) {
      this.clickCount = 0;
    }

    this.clickCount++;
    this.lastClickTime = currentTime;

    // After triple click, proceed to next stage
    if (this.clickCount === 3) {
      this.completed.emit();
      this.clickCount = 0;
    }
  }
} 