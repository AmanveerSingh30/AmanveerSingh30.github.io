import { Component, OnInit, ChangeDetectionStrategy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { EmojiService } from '../../services/emoji.service';
import { EmojiPopupPage, EmojiType } from '../../models/emoji.model';

@Component({
  selector: 'app-emoji-popup',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div 
      class="popup-overlay" 
      *ngIf="isVisible"
      (click)="onOverlayClick($event)">
      
      <div class="popup-content" (click)="onContentClick($event)">
        <div class="emoji-header">
          <div class="emoji-icon">{{ currentEmojiType?.emoji }}</div>
          <div class="page-counter">{{ currentPageIndex + 1 }} / {{ pages.length }}</div>
        </div>
        
        <div class="popup-body">
          <div class="page-content">
            <p>{{ currentPage?.text }}</p>
          </div>
          
          <div class="page-navigation">
            <button 
              class="nav-button prev-button" 
              *ngIf="currentPageIndex > 0"
              (click)="previousPage()">
              Previous
            </button>
            
            <div class="page-indicators">
              <div 
                class="indicator-dot" 
                *ngFor="let page of pages; let i = index"
                [class.active]="i === currentPageIndex">
              </div>
            </div>
            
            <button 
              class="nav-button next-button" 
              *ngIf="currentPageIndex < pages.length - 1"
              (click)="nextPage()">
              Next
            </button>
            
            <button 
              class="nav-button continue-button" 
              *ngIf="currentPageIndex === pages.length - 1"
              (click)="closePopup()">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 10, 20, 0.8);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 1;
      transition: opacity 0.3s ease;
    }
    
    .popup-content {
      background: rgba(15, 25, 35, 0.8);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      border-radius: 16px;
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: white;
      animation: slideUp 0.3s ease-out;
    }
    
    .emoji-header {
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
    }
    
    .emoji-icon {
      font-size: 42px;
      margin-bottom: 5px;
    }
    
    .page-counter {
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 14px;
      opacity: 0.7;
    }
    
    .popup-body {
      flex: 1;
      padding: 20px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 200px;
    }
    
    .page-content {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 20px;
      padding: 10px;
      min-height: 150px;
      max-height: 300px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      
      p {
        line-height: 1.7;
        font-size: 18px;
        margin: 0;
        color: rgba(255, 255, 255, 0.9);
        white-space: pre-line;
        padding: 10px;
      }
      
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-track {
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 3px;
      }
    }
    
    .page-navigation {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .page-indicators {
      display: flex;
      gap: 8px;
      justify-content: center;
    }
    
    .indicator-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.3);
      transition: all 0.2s ease;
      
      &.active {
        background-color: #8ed6ff;
        transform: scale(1.2);
        box-shadow: 0 0 10px rgba(142, 214, 255, 0.5);
      }
    }
    
    .nav-button {
      background: rgba(70, 130, 180, 0.3);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(70, 130, 180, 0.5);
        transform: translateY(-2px);
      }
      
      &.continue-button {
        background: rgba(100, 200, 255, 0.3);
        
        &:hover {
          background: rgba(100, 200, 255, 0.5);
        }
      }
    }
    
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmojiPopupComponent implements OnInit {
  isVisible = false;
  currentEmojiType: EmojiType | null = null;
  pages: EmojiPopupPage[] = [];
  currentPageIndex = 0;
  currentPage: EmojiPopupPage | null = null;
  
  constructor(
    private emojiService: EmojiService,
    private cd: ChangeDetectorRef
  ) {
    console.log('EmojiPopupComponent initialized');
  }
  
  ngOnInit(): void {
    console.log('EmojiPopupComponent ngOnInit');
    
    // Subscribe to popup visibility
    this.emojiService.showPopup$.subscribe(show => {
      console.log('Popup visibility changed:', show);
      this.isVisible = show;
      this.cd.detectChanges();
    }, error => {
      console.error('Error in popup visibility subscription:', error);
    });
    
    // Subscribe to current emoji type
    this.emojiService.currentEmojiType$.subscribe(emojiType => {
      console.log('Current emoji type changed:', emojiType);
      this.currentEmojiType = emojiType;
      this.cd.detectChanges();
    }, error => {
      console.error('Error in emoji type subscription:', error);
    });
    
    // Subscribe to popup pages
    this.emojiService.popupPages$.subscribe(pages => {
      console.log('Popup pages updated:', pages.length);
      this.pages = pages;
      this.currentPageIndex = 0;
      this.updateCurrentPage();
      this.cd.detectChanges();
    }, error => {
      console.error('Error in popup pages subscription:', error);
    });
  }
  
  /**
   * Navigate to the next page
   */
  nextPage(): void {
    console.log('Navigate to next page');
    if (this.currentPageIndex < this.pages.length - 1) {
      this.currentPageIndex++;
      this.updateCurrentPage();
      this.cd.detectChanges();
    }
  }
  
  /**
   * Navigate to the previous page
   */
  previousPage(): void {
    console.log('Navigate to previous page');
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
      this.updateCurrentPage();
      this.cd.detectChanges();
    }
  }
  
  /**
   * Update current page based on index
   */
  private updateCurrentPage(): void {
    if (this.pages.length > 0 && this.currentPageIndex < this.pages.length) {
      this.currentPage = this.pages[this.currentPageIndex];
      console.log('Current page updated:', this.currentPageIndex + 1, 'of', this.pages.length);
    } else {
      this.currentPage = null;
    }
  }
  
  /**
   * Close the popup
   */
  closePopup(): void {
    console.log('Popup close requested by user');
    this.emojiService.closePopup();
  }
  
  /**
   * Handle overlay click to prevent closing when clicking content
   */
  onOverlayClick(event: MouseEvent): void {
    // Only close if clicked directly on the overlay
    if (event.target === event.currentTarget) {
      console.log('Overlay clicked, closing popup');
      this.closePopup();
    }
  }
  
  /**
   * Prevent content click from propagating to overlay
   */
  onContentClick(event: MouseEvent): void {
    event.stopPropagation();
  }
  
  /**
   * Handle keyboard navigation
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.isVisible) return;
    
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        this.nextPage();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        this.previousPage();
        break;
      case 'Escape':
        this.closePopup();
        break;
      case 'Enter':
        if (this.currentPageIndex === this.pages.length - 1) {
          this.closePopup();
        } else {
          this.nextPage();
        }
        break;
    }
  }
} 