import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MusicPlayerComponent } from '../../music-player/music-player.component';
import { MusicPlayerService } from '../../music-player/services/music-player.service';
import { Track } from '../../music-player/models/track.model';

@Component({
  selector: 'app-decision-stage',
  standalone: true,
  imports: [CommonModule, MusicPlayerComponent],
  templateUrl: './decision-stage.component.html',
  styleUrls: ['./decision-stage.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('0.5s ease-out'))
    ]),
    trigger('textFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class DecisionStageComponent implements OnInit {
  @Output() completed = new EventEmitter<void>();
  private clickCount = 0;
  private lastClickTime = 0;
  buttonsDisabled = false;
  showFlower = false;
  tracks: Track[] = [];
  petals = [
    { id: 1, visible: true },
    { id: 2, visible: true },
    { id: 3, visible: true },
    { id: 4, visible: true },
    { id: 5, visible: true },
    { id: 6, visible: true },
    { id: 7, visible: true }
  ];
  currentPetalIndex = 0;
  animationInterval: any;
  // Yes/No text display
  currentDecision: string = '';
  showDecisionText: boolean = false;
  decisions: string[] = ['Yes', 'No', 'Yes', 'No', 'Yes', 'No', 'Yes']; // Last one is Yes
  showThankYouText: boolean = false; // Add property to control visibility of "Thank you" text
  showDontWorryText: boolean = false; // Add property to control visibility of "Don't worry" text
  showContinueButton: boolean = false; // Property to control visibility of continue button

  constructor(
    private cd: ChangeDetectorRef,
    private musicPlayerService: MusicPlayerService
  ) {}

  ngOnInit(): void {
    // Load music tracks
    this.tracks = this.musicPlayerService.getDecisionStageTracks();

    try {
      // Show the "Don't worry" text
      setTimeout(() => {
        this.buttonsDisabled = true;
        this.showDontWorryText = true;
        this.cd.detectChanges();
      }, 5000); // Show "Don't worry" text after 500ms

      // Hide the "Don't worry" text and show the flower after 5 seconds
      setTimeout(() => {
        this.showDontWorryText = false;
        this.showFlower = true;
        this.startPetalAnimation();
        this.cd.detectChanges();
      }, 8500); // 5 seconds after the first timeout
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  startPetalAnimation(): void {
    try {
      this.animationInterval = setInterval(() => {
        if (this.currentPetalIndex < this.petals.length) {
          // Show the current decision text
          this.currentDecision = this.decisions[this.currentPetalIndex];
           setTimeout(() => {
          this.showDecisionText = true;
          }, 100);
          this.cd.detectChanges();

          // After a short delay, hide the petal
          setTimeout(() => {
            try {
              if (this.currentPetalIndex < this.petals.length) {
                // Hide petal using DOM manipulation instead of animation
                const petalElements = document.querySelectorAll('.petal');
                if (petalElements && petalElements.length > this.currentPetalIndex) {
                  (petalElements[this.currentPetalIndex] as HTMLElement).style.opacity = '0';
                  (petalElements[this.currentPetalIndex] as HTMLElement).style.transform = 'scale(0)';
                  (petalElements[this.currentPetalIndex] as HTMLElement).style.transition = 'all 0.8s ease-out';
                }

                this.petals[this.currentPetalIndex].visible = false;
                this.currentPetalIndex++;
                this.cd.detectChanges(); // Force update after changing visibility
              }

              // If this was the last petal
              if (this.currentPetalIndex === this.petals.length) {
                clearInterval(this.animationInterval);

                // Simulate "Yes" button click animation
                setTimeout(() => {
                  const yesButton = document.querySelector('.decision-button:first-child') as HTMLElement;
                  if (yesButton) {
                    yesButton.classList.add('clicked'); // Add a class for animation
                  }
                }, 500); // Adjust delay as needed                // Show "Thank you for choosing" text after a delay
                setTimeout(() => {
                  this.showThankYouText = true;
                  this.showContinueButton = true;
                  this.cd.detectChanges();


                }, 1500); // Adjust delay as needed
              }
            } catch (error) {
              console.error('Error in petal animation timeout:', error);
            }
          }, 100); // Delay between showing text and removing petal
        }
      }, 2000); // Time between each petal removal
    } catch (error) {
      console.error('Error in startPetalAnimation:', error);
    }
  }
  handleIlyClick(event: MouseEvent): void {
    try {
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - this.lastClickTime;

      if (timeDiff > 500) {
        this.clickCount = 0;
      }

      this.clickCount++;
      this.lastClickTime = currentTime;

      if (this.clickCount === 3) {
        this.completed.emit();
        this.clickCount = 0;
      }
    } catch (error) {
      console.error('Error in handleIlyClick:', error);
    }
  }

  onContinueClick(): void {
    try {
      // Emit the completed event to move to the next stage
      this.completed.emit();
    } catch (error) {
      console.error('Error in onContinueClick:', error);
    }
  }

  ngOnDestroy(): void {
    try {
      if (this.animationInterval) {
        clearInterval(this.animationInterval);
      }
    } catch (error) {
      console.error('Error in ngOnDestroy:', error);
    }
  }
}
