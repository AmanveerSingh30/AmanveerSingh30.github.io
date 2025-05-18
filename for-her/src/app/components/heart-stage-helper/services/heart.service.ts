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
    showHeartTree: false,
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
      showHeartTree: false,
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
      
      // Create a copy of ALL hearts (collected and uncollected)
      // Sort them by date to ensure chronological order
      const allHearts = Array.from(this.heartMap.values()).map(h => ({
        id: h.id,
        image: h.image,
        date: h.date || 'No date',
        collected: collectedHeartIds.includes(h.id)
      }));
      
      // Sort by date (oldest first)
      filmRollHearts = allHearts.sort((a, b) => {
        if (!a.date) return -1;
        if (!b.date) return 1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      console.log('Film roll hearts (all, chronological):', filmRollHearts);
      
      // If it's the final collection, we need to mark the stage as completed
      if (updatedCollection.collectedHearts === updatedCollection.totalHearts) {
        updatedCollection.completed = true;
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
    
    // If completed, show the heart tree after closing film roll
    if (updatedCollection.completed) {
      updatedCollection.showHeartTree = true;
    } else {
      // Resume animations if not all hearts collected
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

  /**
   * Show the film roll again from the heart tree view
   */
  public showFilmRoll(): void {
    console.log('Showing film roll from heart tree view');
    const collection = this.heartCollectionSubject.value;
    
    if (!collection.completed) {
      return;
    }
    
    // Get all hearts (sorted by date)
    const allHearts = Array.from(this.heartMap.values()).map(h => ({
      id: h.id,
      image: h.image,
      date: h.date || 'No date',
      collected: collection.collectedHeartIds.includes(h.id)
    }));
    
    // Sort by date (oldest first)
    const filmRollHearts = allHearts.sort((a, b) => {
      if (!a.date) return -1;
      if (!b.date) return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Update collection state
    const updatedCollection: HeartCollection = {
      ...collection,
      showFilmRoll: true,
      filmRollHearts: filmRollHearts
    };
    
    this.heartCollectionSubject.next(updatedCollection);
  }

  /**
   * Reset the heart tree stage (hide it)
   */
  public hideHeartTree(): void {
    console.log('Hiding heart tree');
    const collection = this.heartCollectionSubject.value;
    
    // Update collection state
    const updatedCollection: HeartCollection = {
      ...collection,
      showHeartTree: false
    };
    
    this.heartCollectionSubject.next(updatedCollection);
  }
} 