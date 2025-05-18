import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeartService } from '../../services/heart.service';
import { HeartCollection } from '../../models/heart.model';

@Component({
  selector: 'app-heart-tracker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="heart-tracker">
      <h3>Hearts Collection</h3>
      <div class="heart-count" [class.complete]="collection.completed">
        {{ collection.collectedHearts }} / {{ collection.totalHearts }}
      </div>
    </div>
  `,
  styles: [`
    .heart-tracker {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 105, 180, 0.5);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 15px;
      min-width: 120px;
      z-index: 100;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      text-align: center;
    }
    
    h3 {
      margin: 0 0 10px;
      font-size: 18px;
      font-weight: 500;
      opacity: 0.9;
    }
    
    .heart-count {
      font-size: 22px;
      font-weight: bold;
      color: rgba(255, 255, 255, 0.9);
      
      &.complete {
        color: #FF1493;
        text-shadow: 0 0 10px rgba(255, 20, 147, 0.7);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeartTrackerComponent implements OnInit {
  collection: HeartCollection = {
    totalHearts: 0,
    collectedHearts: 0,
    completed: false
  };
  
  constructor(
    private heartService: HeartService,
    private cd: ChangeDetectorRef
  ) {
    console.log('HeartTrackerComponent initialized');
  }
  
  ngOnInit(): void {
    console.log('HeartTrackerComponent ngOnInit');
    this.heartService.heartCollection$.subscribe(collection => {
      console.log('HeartTracker received updated collection:', collection);
      this.collection = collection;
      this.cd.detectChanges();
    }, error => {
      console.error('Error in HeartTracker collection subscription:', error);
    });
  }
} 