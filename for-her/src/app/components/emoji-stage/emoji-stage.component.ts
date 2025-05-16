import { Component, OnInit, OnDestroy, EventEmitter, Output, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { EmojiService } from './services/emoji.service';
import { FloatingEmojiComponent } from './components/floating-emoji/floating-emoji.component';
import { EmojiTrackerComponent } from './components/emoji-tracker/emoji-tracker.component';
import { EmojiPopupComponent } from './components/emoji-popup/emoji-popup.component';
import { Emoji } from './models/emoji.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-emoji-stage',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FloatingEmojiComponent,
    EmojiTrackerComponent,
    EmojiPopupComponent
  ],
  template: `
    <div class="emoji-stage" #stageContainer>
      <!-- Floating emojis -->
      <app-floating-emoji
        *ngFor="let emoji of emojis"
        [emoji]="emoji"
        [containerSize]="containerSize"
        [isPaused]="animationPaused"
        (collected)="onEmojiCollected($event)">
      </app-floating-emoji>
      
      <!-- Emoji tracker (top-right corner) -->
      <app-emoji-tracker></app-emoji-tracker>
      
      <!-- Emoji popup (when collecting all of one type) -->
      <app-emoji-popup></app-emoji-popup>
      
      <!-- Stage completion message -->
      <div class="completion-message" *ngIf="stageCompleted">
        <h2>All Emojis Collected!</h2>
        <button class="next-stage-button" (click)="onNextStage()">Continue to Next Stage</button>
      </div>
      
      <!-- Debug controls (only visible with ?debug=true in URL) -->
      <div class="debug-panel" *ngIf="showDebugPanel">
        <h4>Debug Controls</h4>
        <div class="debug-buttons">
          <button (click)="debugShowState()">Show State</button>
          <button (click)="resetStage()">Reset</button>
          <button (click)="debugForcePopup()">Force Popup</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .emoji-stage {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      
      &::before {
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url("/assets/background/blue-sky.png");
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        z-index: -10;
      }
    }
    
    .completion-message {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(15, 25, 35, 0.8);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      border-radius: 16px;
      padding: 30px;
      text-align: center;
      color: white;
      z-index: 500;
      animation: fadeIn 0.5s ease-out;
      
      h2 {
        font-size: 28px;
        margin-bottom: 20px;
        color: #8ed6ff;
        text-shadow: 0 0 10px rgba(142, 214, 255, 0.5);
      }
    }
    
    .next-stage-button {
      background: linear-gradient(to bottom, rgba(100, 200, 255, 0.5), rgba(70, 150, 220, 0.5));
      color: white;
      border: none;
      border-radius: 30px;
      padding: 12px 25px;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        background: linear-gradient(to bottom, rgba(120, 220, 255, 0.6), rgba(90, 170, 240, 0.6));
      }
      
      &:active {
        transform: translateY(1px);
      }
    }
    
    .debug-panel {
      position: fixed;
      bottom: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 10px;
      border-radius: 8px;
      color: white;
      z-index: 1000;
      
      h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        opacity: 0.8;
      }
      
      .debug-buttons {
        display: flex;
        gap: 8px;
        
        button {
          background: rgba(100, 100, 200, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          
          &:hover {
            background: rgba(120, 120, 220, 0.6);
          }
        }
      }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class EmojiStageComponent implements OnInit, OnDestroy {
  @Output() completed = new EventEmitter<void>();
  
  emojis: Emoji[] = [];
  containerSize = { width: 0, height: 0 };
  animationPaused = false;
  stageCompleted = false;
  showDebugPanel = false;
  
  private subscriptions: Subscription[] = [];
  
  constructor(
    private emojiService: EmojiService,
    private cd: ChangeDetectorRef
  ) {
    console.log('EmojiStageComponent initialized');
    
    // Check if debug mode is enabled via URL parameter
    this.showDebugPanel = window.location.search.includes('debug=true');
  }
  
  ngOnInit(): void {
    console.log('EmojiStageComponent ngOnInit');
    
    // Update container size initially and on window resize
    this.updateContainerSize();
    
    // Subscribe to emojis
    const emojisSub = this.emojiService.emojis$.subscribe(emojis => {
      console.log('Received emojis:', emojis.length);
      this.emojis = emojis;
      this.cd.detectChanges();
    }, error => {
      console.error('Error in emojis subscription:', error);
    });
    this.subscriptions.push(emojisSub);
    
    // Subscribe to animation paused state
    const pausedSub = this.emojiService.animationPaused$.subscribe(paused => {
      console.log('Animation paused state:', paused);
      this.animationPaused = paused;
      this.cd.detectChanges();
    }, error => {
      console.error('Error in paused subscription:', error);
    });
    this.subscriptions.push(pausedSub);
    
    // Subscribe to stage completion
    const completionSub = this.emojiService.stageCompleted$.subscribe(completed => {
      console.log('Stage completion state:', completed);
      this.stageCompleted = completed;
      if (completed) {
        this.emojiService.pauseAnimation(true);
      }
      this.cd.detectChanges();
    }, error => {
      console.error('Error in completion subscription:', error);
    });
    this.subscriptions.push(completionSub);
  }
  
  ngOnDestroy(): void {
    console.log('EmojiStageComponent destroyed');
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
   * Handle emoji collection
   */
  onEmojiCollected(emojiId: string): void {
    console.log('Emoji collected:', emojiId);
    this.emojiService.collectEmoji(emojiId);
  }
  
  /**
   * Handle next stage click
   */
  onNextStage(): void {
    console.log('Next stage button clicked');
    this.completed.emit();
  }
  
  /**
   * Reset the emoji stage (for testing/debugging)
   */
  resetStage(): void {
    console.log('Resetting emoji stage');
    this.emojiService.resetStage();
  }
  
  /**
   * Debug function to show current state
   */
  debugShowState(): void {
    console.log('=== EMOJI STAGE DEBUG STATE ===');
    console.log('Emojis:', this.emojis);
    console.log('Animation paused:', this.animationPaused);
    console.log('Stage completed:', this.stageCompleted);
    console.log('Container size:', this.containerSize);
    
    // Access current state from service
    this.emojiService.emojis$.subscribe(emojis => 
      console.log('Service emojis:', emojis));
    this.emojiService.emojiTypes$.subscribe(types => 
      console.log('Service emoji types:', types));
    this.emojiService.showPopup$.subscribe(show => 
      console.log('Service show popup:', show));
    this.emojiService.currentEmojiType$.subscribe(type => 
      console.log('Service current emoji type:', type));
    this.emojiService.popupPages$.subscribe(pages => 
      console.log('Service popup pages:', pages));
  }
  
  /**
   * Debug function to force a popup to show
   */
  debugForcePopup(): void {
    console.log('Forcing popup display for first emoji type');
    const types = this.emojiService['emojiTypesSubject'].value;
    if (types.length > 0) {
      // Show popup for first emoji type
      this.emojiService['showPopupForEmojiType'](types[0]);
    }
  }
} 