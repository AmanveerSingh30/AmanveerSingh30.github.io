import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BoxAnimationComponent } from './components/box-animation/box-animation.component';
import { PuzzleComponent } from './components/puzzle/puzzle.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, BoxAnimationComponent, PuzzleComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  showPuzzle = false;

  constructor(private cd: ChangeDetectorRef) {
    console.log('App component initialized, showPuzzle:', this.showPuzzle);
  }

  onBoxAnimationComplete() {
    console.log('Box animation complete received');
    this.showPuzzle = true;
    console.log('showPuzzle set to:', this.showPuzzle);
    this.cd.detectChanges();
    console.log('Change detection triggered');
  }
}
