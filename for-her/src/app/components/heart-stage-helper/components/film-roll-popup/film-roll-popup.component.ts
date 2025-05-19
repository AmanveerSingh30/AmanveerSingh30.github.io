import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Heart } from '../../models/heart.model';

@Component({
  selector: 'app-film-roll-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './film-roll-popup.component.html',
  styleUrl: './film-roll-popup.component.scss',
  animations: [
    trigger('fadeIn', [
      state('void', style({
        opacity: 0
      })),
      state('true', style({
        opacity: 1
      })),
      transition('void => true', animate('300ms ease-in')),
      transition('true => void', animate('300ms ease-out'))
    ]),
    trigger('popIn', [
      state('in', style({
        opacity: 1,
        transform: 'scale(1)'
      })),
      transition('void => in', [
        style({
          opacity: 0,
          transform: 'scale(0.5)'
        }),
        animate('0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)')
      ])
    ])
  ]
})
export class FilmRollPopupComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() hearts: Heart[] = [];
  @Input() visible: boolean = false;
  @Input() isAllHearts: boolean = false;
  @Output() continue = new EventEmitter<void>();
  @ViewChild('filmStrip') filmStripRef!: ElementRef<HTMLDivElement>;

  constructor() {}

  ngOnInit(): void {
    console.log('FilmRollPopupComponent initialized with', this.hearts.length, 'hearts');
    console.log('Heart data:', this.hearts);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hearts'] || changes['visible']) {
      console.log('Film roll hearts updated:', this.hearts);
      console.log('Visible state:', this.visible);

      if (this.hearts && this.hearts.length > 0) {        // Log each heart to check its data
        this.hearts.forEach((heart, index) => {
          console.log(`Heart ${index}:`, heart.image, heart.date, heart.caption, heart.collected ? 'COLLECTED' : 'NOT COLLECTED');
        });
      }
    }
  }

  ngAfterViewInit(): void {
    // Center the film strip when it becomes visible
    if (this.visible && this.filmStripRef) {
      this.scrollToCenter();
    }
  }

  onContinue(): void {
    console.log('Film roll continue clicked');
    this.continue.emit();
  }

  private scrollToCenter(): void {
    if (this.filmStripRef && this.filmStripRef.nativeElement) {
      const el = this.filmStripRef.nativeElement;
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }
}
