import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Heart } from '../../models/heart.model';

@Component({
  selector: 'app-film-roll-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="film-roll-overlay" *ngIf="visible" [@fadeIn]="visible">
      <div class="film-roll-container">
        <div class="film-strip-header">
          <h2>{{ isAllHearts ? 'Your Complete Journey' : 'Memory Timeline' }}</h2>
        </div>

        <div class="film-strip" #filmStrip>
          <div class="film-holes"></div>
          <div class="film-content">
            <div 
              *ngFor="let heart of hearts; let i = index" 
              class="film-frame animated"
              [@popIn]="'in'" 
              [style.animation-delay]="i * 0.2 + 's'">
              <div class="film-image">
                <img [src]="heart.image" [alt]="'Memory ' + (i + 1)" />
              </div>
              <div class="film-date">{{ heart.date }}</div>
              <div class="frame-number">{{ i + 1 }}</div>
            </div>
          </div>
          <div class="film-holes"></div>
        </div>

        <div class="film-strip-footer">
          <button class="continue-button" (click)="onContinue()">
            {{ isAllHearts ? 'Complete Collection' : 'Continue' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .film-roll-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 20px;
    }
    
    .film-roll-container {
      background-color: #1a1a1a;
      border-radius: 10px;
      width: 100%;
      max-width: 900px;
      padding: 20px;
      color: white;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    
    .film-strip-header {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .film-strip-header h2 {
      color: #FF69B4;
      margin: 0;
      font-size: 28px;
      text-shadow: 0 0 10px rgba(255, 105, 180, 0.5);
    }
    
    .film-strip {
      display: flex;
      flex-direction: column;
      max-width: 100%;
      overflow-x: auto;
      margin-bottom: 20px;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE and Edge */
      position: relative;
    }
    
    .film-strip::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
    
    .film-holes {
      height: 20px;
      background-image: repeating-linear-gradient(
        to right,
        transparent,
        transparent 30px,
        #333 30px,
        #333 40px,
        transparent 40px,
        transparent 60px,
        #333 60px,
        #333 70px
      );
    }
    
    .film-content {
      display: flex;
      padding: 10px 0;
      gap: 20px;
      min-height: 220px;
      overflow-x: auto;
    }
    
    .film-frame {
      flex: 0 0 auto;
      width: 200px;
      height: 200px;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: #222;
      border: 2px solid #444;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      transition: transform 0.3s ease;
    }
    
    @keyframes popIn {
      0% { transform: scale(0.5); opacity: 0; }
      70% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }

    .film-frame.animated {
      animation: popIn 0.5s forwards;
    }
    
    .film-frame:hover {
      transform: scale(1.05);
    }
    
    .film-image {
      width: 90%;
      height: 150px;
      margin: 10px auto 5px;
      overflow: hidden;
      border: 1px solid #555;
    }
    
    .film-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    .film-frame:hover .film-image img {
      transform: scale(1.1);
    }
    
    .film-date {
      font-size: 14px;
      color: #FF69B4;
      margin-top: 5px;
      padding: 3px 8px;
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: 10px;
    }
    
    .frame-number {
      position: absolute;
      top: 5px;
      left: 5px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
    
    .film-strip-footer {
      text-align: center;
      margin-top: 20px;
    }
    
    .continue-button {
      background: linear-gradient(135deg, #FF1493, #FF69B4);
      color: white;
      border: none;
      padding: 12px 28px;
      font-size: 18px;
      border-radius: 30px;
      cursor: pointer;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(255, 20, 147, 0.4);
      transition: all 0.3s ease;
    }
    
    .continue-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(255, 20, 147, 0.5);
    }
  `],
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
      
      if (this.hearts && this.hearts.length > 0) {
        // Log each heart to check its data
        this.hearts.forEach((heart, index) => {
          console.log(`Heart ${index}:`, heart.image, heart.date);
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