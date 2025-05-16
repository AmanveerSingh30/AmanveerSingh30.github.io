import { Component, EventEmitter, OnInit, Output, Input, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-typewriter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './typewriter.component.html',
  styleUrls: ['./typewriter.component.scss']
})
export class TypewriterComponent implements OnInit {
  @Input() showTypewriter: boolean = false;
  @Output() completed = new EventEmitter<void>();

  pageTexts: string[] = [];
  displayedText: string = '';
  currentPageIndex: number = 0;
  isAnimating: boolean = false;
  isFinished: boolean = false;
  isLoading: boolean = true;

  // Track visited pages
  visitedPages: Set<number> = new Set();

  private typingSpeed: number = 1; // milliseconds per character
  private textsLoaded: boolean = false;
  private typingInterval: any = null;

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {
    console.log('Typewriter component constructed');
  }

  ngOnInit() {
    console.log('Typewriter component initialized');
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
  }

  private async loadTextFiles(): Promise<void> {
    console.log('Loading text files');
    try {
      const page1 = await firstValueFrom(this.http.get('assets/stage1txt/page1.txt', { responseType: 'text' }));
      const page2 = await firstValueFrom(this.http.get('assets/stage1txt/page2.txt', { responseType: 'text' }));
      const page3 = await firstValueFrom(this.http.get('assets/stage1txt/page3.txt', { responseType: 'text' }));

      this.pageTexts = [page1, page2, page3];
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
}
