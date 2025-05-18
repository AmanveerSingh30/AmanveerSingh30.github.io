import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { Heart, HeartCollection } from '../models/heart.model';
import { heartsConfig } from '../data/heart-config';

@Injectable({
  providedIn: 'root'
})
export class HeartService {
  // Hearts instances BehaviorSubject
  private heartsSubject = new BehaviorSubject<Heart[]>([]);
  public hearts$ = this.heartsSubject.asObservable();
  
  // Heart collection state BehaviorSubject
  private heartCollectionSubject = new BehaviorSubject<HeartCollection>({
    totalHearts: 0,
    collectedHearts: 0,
    completed: false
  });
  public heartCollection$ = this.heartCollectionSubject.asObservable();
  
  // Animation paused state
  private animationPausedSubject = new BehaviorSubject<boolean>(false);
  public animationPaused$ = this.animationPausedSubject.asObservable();

  constructor() {
    console.log('HeartService initialized');
    this.initializeHearts();
  }

  /**
   * Initialize heart instances based on configuration
   */
  private initializeHearts(): void {
    console.log('Initializing hearts from config:', heartsConfig);
    const hearts: Heart[] = [];
    
    heartsConfig.forEach(config => {
      hearts.push({
        id: uuidv4(),
        image: config.image,
        collected: false
      });
    });
    
    console.log(`Created ${hearts.length} heart instances`);
    this.heartsSubject.next(hearts);
    
    // Update the collection state
    this.heartCollectionSubject.next({
      totalHearts: hearts.length,
      collectedHearts: 0,
      completed: false
    });
  }

  /**
   * Handle heart collection when clicked
   */
  public collectHeart(heartId: string): void {
    console.log(`Collecting heart with ID: ${heartId}`);
    const hearts = this.heartsSubject.value;
    const collection = this.heartCollectionSubject.value;
    
    // Find the heart to collect
    const heartIndex = hearts.findIndex(h => h.id === heartId);
    if (heartIndex === -1) {
      console.error(`Heart with ID ${heartId} not found`);
      return;
    }
    
    // Mark as collected
    const heart = hearts[heartIndex];
    heart.collected = true;
    
    // Update collection state
    const updatedCollection = {
      ...collection,
      collectedHearts: collection.collectedHearts + 1
    };
    
    // Check if all hearts are collected
    if (updatedCollection.collectedHearts === updatedCollection.totalHearts) {
      console.log('All hearts collected!');
      updatedCollection.completed = true;
    }
    
    // Update subjects
    this.heartsSubject.next([...hearts]);
    this.heartCollectionSubject.next(updatedCollection);
    
    console.log(`Updated collection: ${updatedCollection.collectedHearts}/${updatedCollection.totalHearts}`);
  }

  /**
   * Pause/resume animation
   */
  public pauseAnimation(paused: boolean): void {
    console.log(`${paused ? 'Pausing' : 'Resuming'} heart animations`);
    this.animationPausedSubject.next(paused);
  }

  /**
   * Reset the heart stage (for testing/debugging)
   */
  public resetStage(): void {
    console.log('Resetting heart stage');
    this.initializeHearts();
    this.pauseAnimation(false);
  }
} 