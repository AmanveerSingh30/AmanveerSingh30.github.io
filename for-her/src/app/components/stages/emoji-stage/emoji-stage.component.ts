import { Component, OnInit, OnDestroy, EventEmitter, Output, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';


import { Subscription } from 'rxjs';
import { EmojiTrackerComponent } from '../../emoji-stage-helper/components/emoji-tracker/emoji-tracker.component';
import { EmojiPopupComponent } from '../../emoji-stage-helper/components/emoji-popup/emoji-popup.component';
import { FloatingEmojiComponent } from '../../emoji-stage-helper/components/floating-emoji/floating-emoji.component';
import { MusicPlayerComponent } from '../../music-player/music-player.component';
import { MusicPlayerService } from '../../music-player/services/music-player.service';
import { Track } from '../../music-player/models/track.model';
import { Emoji } from '../../emoji-stage-helper/models/emoji.model';
import { EmojiService } from '../../emoji-stage-helper/services/emoji.service';

@Component({
  selector: 'app-emoji-stage',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FloatingEmojiComponent,
    EmojiTrackerComponent,
    EmojiPopupComponent,
    MusicPlayerComponent
  ],
   templateUrl: './emoji-stage.component.html',
  styleUrl: './emoji-stage.component.scss'
})
export class EmojiStageComponent implements OnInit, OnDestroy {
  @Output() completed = new EventEmitter<void>();

  emojis: Emoji[] = [];
  tracks: Track[] = [];
  containerSize = { width: 0, height: 0 };
  animationPaused = false;
  stageCompleted = false;
  showDebugPanel = false;

  private subscriptions: Subscription[] = [];

  private clickCount = 0;
  private lastClickTime = 0;

  constructor(
    private emojiService: EmojiService,
    private musicPlayerService: MusicPlayerService,
    private cd: ChangeDetectorRef
  ) {
    console.log('EmojiStageComponent initialized');

    // Check if debug mode is enabled via URL parameter
    this.showDebugPanel = window.location.search.includes('debug=true');
  }

  ngOnInit(): void {
    console.log('EmojiStageComponent ngOnInit');

    // Load music tracks
    this.tracks = this.musicPlayerService.getEmojiStageTracks();

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
