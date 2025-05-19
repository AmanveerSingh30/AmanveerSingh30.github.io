import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BoxAnimationComponent } from './components/box-animation/box-animation.component';
import { PuzzleStageComponent } from './components/stages/puzzle-stage/puzzle-stage.component';
import { TypewriterStageComponent } from './components/stages/typewriter-stage/typewriter-stage.component';
import { EmojiStageComponent } from './components/stages/emoji-stage/emoji-stage.component';
import { HeartStageComponent } from './components/stages/heart-stage/heart-stage.component';
import { DecisionStageComponent } from './components/stages/decision-stage/decision-stage.component';
import { EndStageComponent } from './components/stages/end-stage/end-stage.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PuzzleUiComponent } from './components/puzzle-ui/puzzle-ui.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [    RouterOutlet,
    CommonModule,
    HttpClientModule,
    BoxAnimationComponent,
    PuzzleStageComponent,
    PuzzleUiComponent,
    TypewriterStageComponent,
    EmojiStageComponent,
    HeartStageComponent,
    DecisionStageComponent,
    EndStageComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  showPuzzle = false;
  showTypewriter = false;
  showEmojiStage = false;
  showHeartStage = false;
  showDecisionStage = false;
  showEndStage = false;
  showNextStage = false;

  constructor(private cd: ChangeDetectorRef) {
    console.log('App component initialized');
  }

  onBoxAnimationComplete() {
    console.log('Box animation complete received');
    this.showPuzzle = true;
    console.log('showPuzzle set to:', this.showPuzzle);
    this.cd.detectChanges();
  }

  onPuzzleComplete() {
    console.log('Puzzle complete received');
    this.showPuzzle = false;

    // Ensure the typewriter component receives a fresh signal to start
    // by setting to false first (in case it was already true)
    // this.showTypewriter = false;
    // this.cd.detectChanges();

    // Then set to true after a small delay to trigger ngOnChanges
    setTimeout(() => {
      this.showTypewriter = true;
      console.log('showTypewriter set to:', this.showTypewriter);
      this.cd.detectChanges();
    }, 100);
  }

  onTypewriterComplete() {
    console.log('Typewriter complete received');
    this.showTypewriter = false;
    this.showEmojiStage = true;
    console.log('showEmojiStage set to:', this.showEmojiStage);
    this.cd.detectChanges();
  }

  onEmojiStageComplete() {
    console.log('Emoji stage complete received');
    this.showEmojiStage = false;
    this.showHeartStage = true;
    console.log('showHeartStage set to:', this.showHeartStage);
    this.cd.detectChanges();
  }

  onHeartStageComplete() {
    console.log('Heart stage complete received');
    this.showHeartStage = false;
    this.showDecisionStage = true;
    console.log('showDecisionStage set to:', this.showDecisionStage);
    this.cd.detectChanges();
  }

  onDecisionStageComplete() {
    console.log('Decision stage complete received');
    this.showDecisionStage = false;
    this.showEndStage = true;
    console.log('showEndStage set to:', this.showEndStage);
    this.cd.detectChanges();
  }

  onEndStageComplete() {
    console.log('End stage complete received');
    this.showEndStage = false;
    this.showNextStage = true;
    console.log('showNextStage set to:', this.showNextStage);
    this.cd.detectChanges();
  }
}
