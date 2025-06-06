import { Component, EventEmitter, OnInit, Output, Input, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HeartParticlesComponent } from '../../heart-particles/heart-particles.component';
import { MusicPlayerComponent } from '../../music-player/music-player.component';
import { MusicPlayerService } from '../../music-player/services/music-player.service';
import { Track } from '../../music-player/models/track.model';

@Component({
  selector: 'app-typewriter-stage',
  standalone: true,
  imports: [CommonModule, HeartParticlesComponent, MusicPlayerComponent],
  templateUrl: './typewriter-stage.component.html',
  styleUrls: ['./typewriter-stage.component.scss']
})
export class TypewriterStageComponent implements OnInit {
  @Input() showTypewriter: boolean = false;
  @Output() completed = new EventEmitter<void>();

  private clickCount = 0;
  private lastClickTime = 0;

  pageTexts: string[] = [];
  displayedText: string = '';
  currentPageIndex: number = 0;
  isAnimating: boolean = false;
  isFinished: boolean = false;
  isLoading: boolean = true;
  showHeartParticles: boolean = true;
  tracks: Track[] = [];

  // Track visited pages
  visitedPages: Set<number> = new Set();
  private typingSpeed: number = 1; // milliseconds per character
  private textsLoaded: boolean = false;
  private typingInterval: any = null;

  // Helper method to remove filepath comments from text files
  private removeFilePathComment(text: string): string {
    // Check if the text starts with a filepath comment line
    if (text.startsWith('// filepath:')) {
      // Split by newline and remove the first line
      const lines = text.split('\n');
      return lines.slice(1).join('\n');
    }
    return text;
  }

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private musicPlayerService: MusicPlayerService
  ) {
    console.log('Typewriter component constructed');
  }

  ngOnInit() {
    console.log('Typewriter component initialized');
    // Load music tracks
    this.tracks = this.musicPlayerService.getTypewriterStageTracks();

    // Preload the text files immediately to avoid delay later
    this.loadTextFiles().then(() => {
      this.textsLoaded = true;
      console.log('Text files preloaded');

      // If showTypewriter is already true, start the typewriter
      if (this.showTypewriter) {
        this.initializeTypewriter();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Typewriter ngOnChanges', changes);
    if (changes['showTypewriter'] && changes['showTypewriter'].currentValue === true) {
      console.log('Typewriter showTypewriter changed to true');

      // If texts are already loaded, start immediately
      if (this.textsLoaded) {
        this.initializeTypewriter();
      } else {
        // Otherwise wait for loading to complete
        this.loadTextFiles().then(() => {
          this.textsLoaded = true;
          this.initializeTypewriter();
        });
      }
    }
  }

  private initializeTypewriter() {
    console.log('Initializing typewriter');

    if (this.pageTexts.length > 0) {
      console.log('Starting typewriter animation');
      this.isLoading = false;

      // Reset to first page if restarting
      if (this.currentPageIndex >= this.pageTexts.length) {
        this.currentPageIndex = 0;
      }

      this.cd.detectChanges(); // Ensure the view is updated
      this.startTypewriterAnimation();
    } else {
      console.error('No text files loaded for typewriter');
    }
  }  private async loadTextFiles(): Promise<void> {
    console.log('Loading text files');
    try {
      let page1 = await firstValueFrom(this.http.get('assets/stage1txt/page1.txt', { responseType: 'text' }));
      let page2 = await firstValueFrom(this.http.get('assets/stage1txt/page2.txt', { responseType: 'text' }));
      let page3 = await firstValueFrom(this.http.get('assets/stage1txt/page3.txt', { responseType: 'text' }));
      let page4 = await firstValueFrom(this.http.get('assets/stage1txt/page4.txt', { responseType: 'text' }));
      let page5 = await firstValueFrom(this.http.get('assets/stage1txt/page5.txt', { responseType: 'text' }));

      // Remove the filepath comment line if it exists
      page1 = this.removeFilePathComment(page1);
      page2 = this.removeFilePathComment(page2);
      page3 = this.removeFilePathComment(page3);
      page4 = this.removeFilePathComment(page4);
      page5 = this.removeFilePathComment(page5);

      this.pageTexts = [page1, page2, page3, page4, page5];
      console.log('Text files loaded successfully');
    } catch (error) {
      console.error('Error loading text files:', error);
    }
  }
  startTypewriterAnimation(): void {
    console.log('Starting typewriter animation for page', this.currentPageIndex);

    if (this.currentPageIndex >= this.pageTexts.length) {
      this.isFinished = true;
      return;
    }

    // Get the text for the current page
    const fullText = this.pageTexts[this.currentPageIndex];

    // Check if page has been visited before
    if (this.visitedPages.has(this.currentPageIndex)) {
      // If already visited, just show the text without animation
      console.log('Page already visited, showing text immediately');
      this.displayedText = fullText;
      return;
    }

    // Mark this page as visited
    this.visitedPages.add(this.currentPageIndex);

    // Clear any existing interval
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }

    this.isAnimating = true;
    this.displayedText = '';

    let currentIndex = 0;

    this.typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        this.displayedText += fullText[currentIndex];
        currentIndex++;
        this.cd.detectChanges(); // Update the view on each character
      } else {
        clearInterval(this.typingInterval);
        this.typingInterval = null;
        this.isAnimating = false;
        this.cd.detectChanges(); // Ensure the view is updated when animation completes
      }
    }, this.typingSpeed);
  }

  // Stop the typing animation immediately and show the full text
  skipTyping(): void {
    if (this.isAnimating && this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
      this.isAnimating = false;

      // Show the complete text for the current page
      if (this.currentPageIndex < this.pageTexts.length) {
        this.displayedText = this.pageTexts[this.currentPageIndex];
      }

      this.cd.detectChanges();
    }
  }

  goToPage(pageIndex: number): void {
    // Skip any ongoing animation
    this.skipTyping();

    // Set the new page index
    this.currentPageIndex = pageIndex;

    // Reset finished state if going back from last page
    this.isFinished = false;

    // If we've already visited this page, show text immediately
    if (this.visitedPages.has(pageIndex)) {
      this.displayedText = this.pageTexts[pageIndex];
      this.cd.detectChanges();
    } else {
      // Otherwise start the typewriter animation
      this.startTypewriterAnimation();
    }
  }

  goToNextStage(): void {
    console.log('Going to next stage');
    // Skip any ongoing animation and immediately proceed
    this.skipTyping();
    this.completed.emit();
  }

  toggleHeartParticles(show: boolean): void {
    this.showHeartParticles = show;
    this.cd.detectChanges();
  }

  handleIlyClick(event: MouseEvent): void {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - this.lastClickTime;

    // Reset click count if more than 500ms between clicks
    if (timeDiff > 500) {
      this.clickCount = 0;
    }

    this.clickCount++;
    this.lastClickTime = currentTime;

    // After triple click, proceed to next stage
    if (this.clickCount === 3) {
      this.completed.emit();
      this.clickCount = 0;
    }
  }
}
