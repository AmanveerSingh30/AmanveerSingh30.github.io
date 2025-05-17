import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

import { Emoji, EmojiType, EmojiPopupPage } from '../models/emoji.model';
import { emojiConfig } from '../data/emoji-config';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {
  // Emoji instances BehaviorSubject
  private emojisSubject = new BehaviorSubject<Emoji[]>([]);
  public emojis$ = this.emojisSubject.asObservable();
  
  // Emoji types BehaviorSubject
  private emojiTypesSubject = new BehaviorSubject<EmojiType[]>(
    JSON.parse(JSON.stringify(emojiConfig)) // Deep copy to avoid modifying original
  );
  public emojiTypes$ = this.emojiTypesSubject.asObservable();
  
  // Popup state
  private showPopupSubject = new BehaviorSubject<boolean>(false);
  public showPopup$ = this.showPopupSubject.asObservable();
  
  // Current emoji type for popup
  private currentEmojiTypeSubject = new BehaviorSubject<EmojiType | null>(null);
  public currentEmojiType$ = this.currentEmojiTypeSubject.asObservable();
  
  // Popup content pages
  private popupPagesSubject = new BehaviorSubject<EmojiPopupPage[]>([]);
  public popupPages$ = this.popupPagesSubject.asObservable();
  
  // Stage completion
  private stageCompletedSubject = new BehaviorSubject<boolean>(false);
  public stageCompleted$ = this.stageCompletedSubject.asObservable();
  
  // Animation paused state
  private animationPausedSubject = new BehaviorSubject<boolean>(false);
  public animationPaused$ = this.animationPausedSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('EmojiService initialized');
    this.initializeEmojis();
  }

  /**
   * Initialize emoji instances based on configuration
   */
  private initializeEmojis(): void {
    console.log('Initializing emojis from config:', emojiConfig);
    const emojis: Emoji[] = [];
    const types = this.emojiTypesSubject.value;
    
    types.forEach(type => {
      for (let i = 0; i < type.count; i++) {
        emojis.push({
          id: uuidv4(),
          type: type.emoji,
          collected: false
        });
      }
    });
    
    console.log(`Created ${emojis.length} emoji instances`);
    this.emojisSubject.next(emojis);
  }

  /**
   * Handle emoji collection when clicked
   */
  public collectEmoji(emojiId: string): void {
    console.log(`Collecting emoji with ID: ${emojiId}`);
    const emojis = this.emojisSubject.value;
    const types = this.emojiTypesSubject.value;
    
    // Find the emoji to collect
    const emojiIndex = emojis.findIndex(e => e.id === emojiId);
    if (emojiIndex === -1) {
      console.error(`Emoji with ID ${emojiId} not found`);
      return;
    }
    
    // Mark as collected
    const emoji = emojis[emojiIndex];
    emoji.collected = true;
    
    // Update emoji types count
    const typeIndex = types.findIndex(t => t.emoji === emoji.type);
    if (typeIndex !== -1) {
      types[typeIndex].collected += 1;
      console.log(`Updated count for ${types[typeIndex].emoji}: ${types[typeIndex].collected}/${types[typeIndex].count}`);
      
      // Check if all of this type are collected
      if (types[typeIndex].collected === types[typeIndex].count && !types[typeIndex].allCollected) {
        console.log(`All ${types[typeIndex].emoji} emojis collected!`);
        types[typeIndex].allCollected = true;
        this.showPopupForEmojiType(types[typeIndex]);
      }
    }
    
    // Update subjects
    this.emojisSubject.next([...emojis]);
    this.emojiTypesSubject.next([...types]);
    
    // Check if all emojis are collected
    this.checkStageCompletion();
  }

  /**
   * Show popup for a specific emoji type
   */
  private showPopupForEmojiType(emojiType: EmojiType): void {
    console.log(`Showing popup for emoji type: ${emojiType.emoji}`);
    this.currentEmojiTypeSubject.next(emojiType);
    this.loadEmojiContent(emojiType.textFile)
      .subscribe(pages => {
        console.log(`Loaded ${pages.length} content pages for ${emojiType.emoji}`);
        this.popupPagesSubject.next(pages);
        this.pauseAnimation(true);
        this.showPopupSubject.next(true);
      }, error => {
        console.error(`Error loading content for ${emojiType.emoji}:`, error);
      });
  }

  /**
   * Load content for an emoji type
   */
  private loadEmojiContent(textFile: string): Observable<EmojiPopupPage[]> {
    console.log(`Loading content from file: ${textFile}`);
    return this.http.get(`assets/emoji-texts/${textFile}`, { responseType: 'text' })
      .pipe(
        map(content => {
          // Split content by empty lines
          // First, normalize line endings
          const normalizedContent = content.replace(/\r\n/g, '\n');
          
          // Then split by double newlines
          const paragraphs = normalizedContent.split(/\n\s*\n/)
            .filter(p => p.trim().length > 0);
          
          console.log(`Parsed ${paragraphs.length} paragraphs from content:`, paragraphs);
          
          // If there's only one long paragraph, try to split it into smaller chunks
          if (paragraphs.length === 1 && paragraphs[0].length > 500) {
            // Split into sentences and then group them
            const sentences = paragraphs[0].match(/[^.!?]+[.!?]+/g) || [];
            console.log(`Split long paragraph into ${sentences.length} sentences`);
            
            // Group sentences into pages (2-3 sentences per page)
            const sentencesPerPage = 2;
            const pages: EmojiPopupPage[] = [];
            
            for (let i = 0; i < sentences.length; i += sentencesPerPage) {
              const pageText = sentences.slice(i, i + sentencesPerPage).join(' ').trim();
              pages.push({
                text: pageText,
                pageNumber: pages.length + 1
              });
            }
            
            console.log(`Created ${pages.length} pages from sentences`);
            return pages;
          }
          
          // Convert paragraphs to pages
          return paragraphs.map((text, index) => ({
            text: text.trim(),
            pageNumber: index + 1
          }));
        }),
        catchError(error => {
          console.error(`Error loading emoji content for ${textFile}:`, error);
          return of([{ text: 'Content not available', pageNumber: 1 }]);
        })
      );
  }

  /**
   * Close the popup
   */
  public closePopup(): void {
    console.log('Closing emoji popup');
    // Mark current emoji type as shown
    const currentType = this.currentEmojiTypeSubject.value;
    if (currentType) {
      const types = this.emojiTypesSubject.value;
      const typeIndex = types.findIndex(t => t.emoji === currentType.emoji);
      if (typeIndex !== -1) {
        types[typeIndex].contentShown = true;
        this.emojiTypesSubject.next([...types]);
      }
    }
    
    this.currentEmojiTypeSubject.next(null);
    this.popupPagesSubject.next([]);
    this.showPopupSubject.next(false);
    this.pauseAnimation(false);
    
    // Check stage completion again (in case this was the last popup)
    this.checkStageCompletion();
  }

  /**
   * Pause/resume animation
   */
  public pauseAnimation(paused: boolean): void {
    console.log(`${paused ? 'Pausing' : 'Resuming'} emoji animations`);
    this.animationPausedSubject.next(paused);
  }

  /**
   * Check if stage is completed (all emojis collected and content shown)
   */
  private checkStageCompletion(): void {
    const types = this.emojiTypesSubject.value;
    const allCompleted = types.every(type => 
      type.allCollected && type.contentShown
    );
    
    console.log('Checking stage completion:', allCompleted);
    if (allCompleted) {
      console.log('All emoji types collected and content shown - stage completed!');
      this.stageCompletedSubject.next(true);
    }
  }

  /**
   * Reset the emoji stage (for testing/debugging)
   */
  public resetStage(): void {
    console.log('Resetting emoji stage');
    // Reset emoji types
    this.emojiTypesSubject.next(JSON.parse(JSON.stringify(emojiConfig)));
    
    // Reset emojis
    this.initializeEmojis();
    
    // Reset stage completion
    this.stageCompletedSubject.next(false);
    
    // Close any popup
    this.showPopupSubject.next(false);
    this.currentEmojiTypeSubject.next(null);
    this.popupPagesSubject.next([]);
    
    // Resume animation
    this.pauseAnimation(false);
  }
} 