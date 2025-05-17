import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LetterOpeningComponent } from '../../letter-opening/letter-opening.component';

@Component({
  selector: 'app-memory-stage',
  standalone: true,
  imports: [CommonModule, LetterOpeningComponent],
  templateUrl: './memory-stage.component.html',
  styleUrl: './memory-stage.component.scss'
})
export class MemoryStageComponent {
  @Output() completed = new EventEmitter<void>();

  private clickCount = 0;
  private lastClickTime = 0;

  onLetterOpened(): void {
    // When letter is opened, emit the completed event after a short delay
    setTimeout(() => {
      this.completed.emit();
    }, 2000); // Give user 2 seconds to see the completed animation
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

  onNextStage(): void {
    // Emit the completed event when skip button is double-clicked
    this.completed.emit();
  }
}
