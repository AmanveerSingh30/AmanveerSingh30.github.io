import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { Heart, HeartCollection } from '../models/heart.model';
import { heartsConfig, heartsPerFilmRoll } from '../data/heart-config';

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
    collectedHeartIds: [],
    completed: false,
    showFilmRoll: false,
    filmRollHearts: []
  });
  public heartCollection$ = this.heartCollectionSubject.asObservable();
  
  // Animation paused state
  private animationPausedSubject = new BehaviorSubject<boolean>(false);
  public animationPaused$ = this.animationPausedSubject.asObservable();

  // All hearts (collected and uncollected) mapped by ID for easy lookup
  private heartMap: Map<string, Heart> = new Map();

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
      const heart: Heart = {
        id: uuidv4(),
        image: config.image,
        date: config.date,
        collected: false
      };
      hearts.push(heart);
      this.heartMap.set(heart.id, heart);
    });
    
    console.log(`Created ${hearts.length} heart instances`);
    this.heartsSubject.next(hearts);
    
    // Update the collection state
    this.heartCollectionSubject.next({
      totalHearts: hearts.length,
      collectedHearts: 0,
      collectedHeartIds: [],
      completed: false,
      showFilmRoll: false,
      filmRollHearts: []
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

    // Add to collected heart IDs
    const collectedHeartIds = [...collection.collectedHeartIds, heartId];
    
    // Update collection state
    const updatedCollection: HeartCollection = {
      ...collection,
      collectedHearts: collection.collectedHearts + 1,
      collectedHeartIds: collectedHeartIds
    };
    
    // Check if we should show film roll (every N hearts or all collected)
    const shouldShowFilmRoll = 
      (updatedCollection.collectedHearts % heartsPerFilmRoll === 0) || 
      (updatedCollection.collectedHearts === updatedCollection.totalHearts);
    
    // Debug logs to understand why film roll isn't showing
    console.log('Film roll check:', {
      collectedHearts: updatedCollection.collectedHearts,
      totalHearts: updatedCollection.totalHearts,
      heartsPerFilmRoll: heartsPerFilmRoll,
      modCheck: updatedCollection.collectedHearts % heartsPerFilmRoll,
      shouldShowFilmRoll: shouldShowFilmRoll
    });
    
    if (shouldShowFilmRoll) {
      console.log(`Showing film roll after collecting ${updatedCollection.collectedHearts} hearts`);
      
      // Get hearts for film roll
      let filmRollHearts: Heart[] = [];
      
      if (updatedCollection.collectedHearts === updatedCollection.totalHearts) {
        // Show all hearts if completed
        filmRollHearts = updatedCollection.collectedHeartIds.map(id => {
          const heart = this.heartMap.get(id);
          if (heart) {
            // Create a copy of the heart with explicit data
            return {
              id: heart.id,
              image: heart.image,
              date: heart.date || 'No date',
              collected: true
            };
          }
          return null;
        }).filter(h => h !== null) as Heart[];
        
        console.log('All hearts film roll:', filmRollHearts);
        updatedCollection.completed = true;
      } else {
        // Show last N hearts
        const lastHeartIds = updatedCollection.collectedHeartIds.slice(-heartsPerFilmRoll);
        filmRollHearts = lastHeartIds.map(id => {
          const heart = this.heartMap.get(id);
          if (heart) {
            // Create a copy of the heart with explicit data
            return {
              id: heart.id,
              image: heart.image,
              date: heart.date || 'No date',
              collected: true
            };
          }
          return null;
        }).filter(h => h !== null) as Heart[];
        
        console.log('Partial film roll:', filmRollHearts);
      }
      
      updatedCollection.showFilmRoll = true;
      updatedCollection.filmRollHearts = filmRollHearts;
      
      // Pause animations while showing film roll
      this.pauseAnimation(true);
    }
    
    // Update subjects
    this.heartsSubject.next([...hearts]);
    this.heartCollectionSubject.next(updatedCollection);
    
    console.log(`Updated collection: ${updatedCollection.collectedHearts}/${updatedCollection.totalHearts}`);
  }

  /**
   * Close the film roll and resume animations
   */
  public closeFilmRoll(): void {
    console.log('Closing film roll');
    const collection = this.heartCollectionSubject.value;
    
    // Update collection state
    const updatedCollection: HeartCollection = {
      ...collection,
      showFilmRoll: false,
      filmRollHearts: []
    };
    
    // Resume animations if not all hearts collected
    if (!updatedCollection.completed) {
      this.pauseAnimation(false);
    }
    
    this.heartCollectionSubject.next(updatedCollection);
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
    this.heartMap.clear();
    this.pauseAnimation(false);
  }

  /**
   * Get a heart by ID
   */
  public getHeartById(id: string): Heart | undefined {
    return this.heartMap.get(id);
  }
} 