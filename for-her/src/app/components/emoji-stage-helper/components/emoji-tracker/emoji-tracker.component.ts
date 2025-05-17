import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { EmojiService } from '../../services/emoji.service';
import { EmojiType } from '../../models/emoji.model';

@Component({
  selector: 'app-emoji-tracker',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="emoji-tracker">
      <h3>Collected</h3>
      <div class="emoji-list">
        <div class="emoji-item" *ngFor="let emojiType of emojiTypes">
          <div class="emoji-icon">{{ emojiType.emoji }}</div>
          <div class="emoji-count" [class.complete]="emojiType.allCollected">
            {{ emojiType.collected }}/{{ emojiType.count }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .emoji-tracker {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(15, 25, 35, 0.5);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 15px;
      min-width: 120px;
      z-index: 100;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      text-align: center;
    }
    
    h3 {
      margin: 0 0 10px;
      font-size: 18px;
      font-weight: 500;
      opacity: 0.9;
    }
    
    .emoji-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .emoji-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      font-size: 16px;
    }
    
    .emoji-icon {
      font-size: 22px;
    }
    
    .emoji-count {
      color: rgba(255, 255, 255, 0.8);
      
      &.complete {
        color: #8ed6ff;
        font-weight: bold;
        text-shadow: 0 0 5px rgba(142, 214, 255, 0.5);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmojiTrackerComponent implements OnInit {
  emojiTypes: EmojiType[] = [];
  
  constructor(
    private emojiService: EmojiService,
    private cd: ChangeDetectorRef
  ) {
    console.log('EmojiTrackerComponent initialized');
  }
  
  ngOnInit(): void {
    console.log('EmojiTrackerComponent ngOnInit');
    this.emojiService.emojiTypes$.subscribe(types => {
      console.log('EmojiTracker received updated types:', types);
      this.emojiTypes = types;
      this.cd.detectChanges();
    }, error => {
      console.error('Error in EmojiTracker types subscription:', error);
    });
  }
} 