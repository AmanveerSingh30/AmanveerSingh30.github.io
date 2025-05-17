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

  onLetterOpened(): void {
    // When letter is opened, emit the completed event after a short delay
    setTimeout(() => {
      this.completed.emit();
    }, 2000); // Give user 2 seconds to see the completed animation
  }

  onNextStage(): void {
    // Emit the completed event when skip button is double-clicked
    this.completed.emit();
  }
}
