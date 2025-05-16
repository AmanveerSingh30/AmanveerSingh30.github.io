import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BoxAnimationComponent } from './components/box-animation/box-animation.component';
import { PuzzleComponent } from './components/puzzle/puzzle.component';
import { TypewriterComponent } from './components/typewriter/typewriter.component';
import { EmojiStageComponent } from './components/emoji-stage/emoji-stage.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    CommonModule, 
    HttpClientModule,
    BoxAnimationComponent, 
    PuzzleComponent,
    TypewriterComponent,
    EmojiStageComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  showPuzzle = false;
  showTypewriter = false;
  showEmojiStage = false;
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
    this.showTypewriter = false;
    this.cd.detectChanges();
    
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
    this.showNextStage = true;
    console.log('showNextStage set to:', this.showNextStage);
    this.cd.detectChanges();
  }
}
