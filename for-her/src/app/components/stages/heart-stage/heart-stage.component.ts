import { Component, OnInit, OnDestroy, EventEmitter, Output, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Subscription } from 'rxjs';
import { HeartTrackerComponent } from '../../heart-stage-helper/components/heart-tracker/heart-tracker.component';
import { FloatingHeartComponent } from '../../heart-stage-helper/components/floating-heart/floating-heart.component';
import { FilmRollPopupComponent } from '../../heart-stage-helper/components/film-roll-popup/film-roll-popup.component';
import { HeartTreeComponent } from '../../heart-stage-helper/components/heart-tree/heart-tree.component';
import { Heart, HeartCollection } from '../../heart-stage-helper/models/heart.model';
import { HeartService } from '../../heart-stage-helper/services/heart.service';

@Component({
  selector: 'app-heart-stage',
  standalone: true,
  imports: [
    CommonModule,
    FloatingHeartComponent,
    HeartTrackerComponent,
    FilmRollPopupComponent,
    HeartTreeComponent
  ],
   templateUrl: './heart-stage.component.html',
  styleUrls: ['./heart-stage.component.scss'],
})
export class HeartStageComponent implements OnInit, OnDestroy {
  @Output() completed = new EventEmitter<void>();

  hearts: Heart[] = [];
  containerSize = { width: 0, height: 0 };
  animationPaused = false;
  stageCompleted = false;
  showDebugPanel = false;
  showFilmRoll = false;
  showHeartTree = false;
  filmRollHearts: Heart[] = [];
  heartTreeText: string = '';

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

    // Set custom text for heart tree (optional)
    this.heartTreeText = `
      <span class="say">My darling,</span><br>
      <span class="say">With each heart you collected, my love for you grew stronger.</span><br>
      <span class="say">Like this tree, our relationship will continue to bloom.</span><br>
      <span class="say">I can't wait to create more memories with you,</span><br>
      <span class="say">And watch our love story unfold, one beautiful moment at a time.</span><br>
      <br>
      <span class="say">Forever yours,</span><br>
      <span class="say"><span class="space"></span> -- Your sweetheart</span>
    `;

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

    // Subscribe to heart collection and film roll state
    const completionSub = this.heartService.heartCollection$.subscribe(collection => {
      console.log('Heart collection state:', collection);
      this.stageCompleted = collection.completed;
      this.showFilmRoll = collection.showFilmRoll;
      this.showHeartTree = collection.showHeartTree;
      this.filmRollHearts = collection.filmRollHearts;

      console.log('Film roll state:', {
        show: this.showFilmRoll,
        hearts: this.filmRollHearts.length,
        collected: this.filmRollHearts.filter(h => h.collected).length,
        uncollected: this.filmRollHearts.filter(h => !h.collected).length,
        completed: this.stageCompleted
      });

      console.log('Heart tree state:', {
        show: this.showHeartTree
      });

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
   * Handle film roll continue button click
   */
  onFilmRollContinue(): void {
    console.log('Film roll continue clicked');
    this.heartService.closeFilmRoll();
  }

  onOpenTimeline(): void {
    console.log('Open timeline clicked from heart tree');
    this.heartService.showFilmRoll();
  }

  /**
   * Handle next stage click
   */
  onNextStage(): void {
    console.log('Next stage clicked');
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
    console.log('Show film roll:', this.showFilmRoll);
    console.log('Film roll hearts:', this.filmRollHearts);
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
