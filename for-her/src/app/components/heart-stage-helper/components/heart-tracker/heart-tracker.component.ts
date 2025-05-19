import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeartService } from '../../services/heart.service';
import { HeartCollection } from '../../models/heart.model';

@Component({
  selector: 'app-heart-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heart-tracker.component.html',
  styleUrl: './heart-tracker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeartTrackerComponent implements OnInit {
  collection: HeartCollection = {
    totalHearts: 0,
    collectedHearts: 0,
    completed: false,
    collectedHeartIds: [],
    showFilmRoll: false,
    filmRollHearts: [],
    showHeartTree: false
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
