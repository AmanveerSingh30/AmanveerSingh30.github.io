import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Output,
  EventEmitter,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import emailjs from 'emailjs-com';
interface Heart {
  x: number;
  y: number;
  vy: number;
  vx: number;
  bouncing: boolean;
}

interface Lyric {
  time: number;
  text: string;
}

@Component({
  selector: 'app-end-stage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './end-stage.component.html',
  styleUrls: ['./end-stage.component.scss'],
})
export class EndStageComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() completed = new EventEmitter<void>();
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number = 0;
  private hearts: Heart[] = [];
  private audio: HTMLAudioElement | null = null;
  private lyricsUpdateInterval: any;

  // Large heart properties
  private largeHeart = { x: 0, y: 0, size: 110 };
  private mouseX: number = 0;
  private mouseY: number = 0;

  showThankYouMessage = false;
  isMuted = false;
  // Lyrics properties
  lyrics: Lyric[] = [];
  currentLyric: string = '';
  currentLyricIndex: number = -1;

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadLyrics();
    this.initAudio();
    this.sendEmail();
    this.showThankYouMessage = true;
  }
  private loadLyrics(): void {
    console.log('Loading lyrics from JSON file...');

    this.http
      .get<Lyric[]>('assets/lyrics/cant-help-falling-in-love.json')
      .subscribe({
        next: (data) => {
          console.log('Lyrics loaded from JSON:', data);
          this.lyrics = data;

          // Set initial lyric
          if (this.lyrics.length > 0) {
            this.currentLyric = this.lyrics[0].text;
            this.currentLyricIndex = 0;
            console.log('Initial lyric set to:', this.currentLyric);
          } else {
            console.warn('Loaded lyrics array is empty');
          }

          // Force a change detection cycle
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error loading lyrics:', err);
          // Fallback to default lyrics if JSON loading fails
          this.setDefaultLyrics();
        },
      });
  }

  private setDefaultLyrics(): void {
    console.log('Using default lyrics');
    this.lyrics = [
      { time: 0, text: 'Wise men say' },
      { time: 3, text: 'Only fools rush in' },
      { time: 7, text: "But I can't help" },
      { time: 10, text: 'Falling in love with you' },
      { time: 15, text: 'Shall I stay?' },
      { time: 18, text: 'Would it be a sin?' },
      { time: 22, text: "If I can't help" },
      { time: 25, text: 'Falling in love with you' },
    ];

    if (this.lyrics.length > 0) {
      this.currentLyric = this.lyrics[0].text;
      this.currentLyricIndex = 0;
    }
  }

  ngAfterViewInit(): void {
    this.initCanvas();
    this.startAnimation();
  }
  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.audio) {
      // We can't remove the bound function directly, so we need to pause and nullify
      this.audio.pause();
      this.audio = null;
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  toggleMute(): void {
    if (this.audio) {
      this.isMuted = !this.isMuted;
      this.audio.muted = this.isMuted;
    }
  }
  private initAudio(): void {
    this.audio = new Audio(
      'assets/sounds/elvis-presley-cant-help-falling-in-love-audio.mp3'
    );
    this.audio.loop = true;
    this.audio.volume = 0.3;

    // Bind updateCurrentLyric method to this component
    const boundUpdateLyrics = this.updateCurrentLyric.bind(this);

    // Manual integration of lyrics with timeupdate event
    this.audio.addEventListener('timeupdate', boundUpdateLyrics);

    // Add loadeddata event to ensure audio is fully loaded before attempting to play
    this.audio.addEventListener('loadeddata', () => {
      console.log('Audio data loaded successfully');
    });

    // Play audio when document is clicked (needed for browsers that require user interaction)
    document.addEventListener(
      'click',
      () => {
        if (this.audio && this.audio.paused) {
          this.audio
            .play()
            .then(() => {
              console.log('Audio started playing after user interaction');
              this.updateCurrentLyric(); // Try to update lyrics immediately
            })
            .catch((error) => {
              console.error('Error playing audio:', error);
            });
        }
      },
      { once: true }
    );

    // Try to play right away (may be blocked by browser)
    this.audio.play().catch((error) => {
      console.log('Auto-play blocked. Click anywhere to start the music.');
    });
  }
  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    this.createHearts(1000); // Increased to 200 hearts
    // Set initial large heart position
    this.largeHeart.x = canvas.width / 2;
    this.largeHeart.y = canvas.height - this.largeHeart.size * 0.7;
  }

  @HostListener('window:resize')
  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private createHearts(count: number): void {
    const canvas = this.canvasRef.nativeElement;
    const centerX = canvas.width / 2;
    const columnWidth = canvas.width * 0.35; // Doubled to 5% of width
    for (let i = 0; i < count; i++) {
      this.hearts.push({
        x: centerX + (Math.random() * columnWidth - columnWidth / 2),
        y: -Math.random() * canvas.height,
        vy: 2.2 + Math.random() * 0.7,
        vx: 0,
        bouncing: false,
      });
    }
  }

  private startAnimation(): void {
    const animate = () => {
      const canvas = this.canvasRef.nativeElement;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update large heart position to follow cursor with smooth movement
      this.largeHeart.x += (this.mouseX - this.largeHeart.x) * 0.1;
      this.largeHeart.y += (this.mouseY - this.largeHeart.y) * 0.1;

      this.updateAndDrawHearts();
      this.drawLargeHeart(
        this.largeHeart.x,
        this.largeHeart.y,
        this.largeHeart.size
      );
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  private updateAndDrawHearts(): void {
    const canvas = this.canvasRef.nativeElement;
    const heartSize = 22;
    for (let i = 0; i < this.hearts.length; i++) {
      const heart = this.hearts[i];
      if (!heart.bouncing) {
        heart.y += heart.vy;
      } else {
        heart.x += heart.vx;
        heart.y += heart.vy;
        heart.vy += 0.18;
        if (heart.y > canvas.height + 40) {
          this.resetHeart(heart, canvas.width, canvas.height);
          continue;
        }
      }

      const dx = heart.x - this.largeHeart.x;
      const dy = heart.y - this.largeHeart.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (!heart.bouncing && dist < this.largeHeart.size * 0.55) {
        heart.bouncing = true;
        heart.vx = dx * 0.13 + (Math.random() - 0.5) * 2.5;
        heart.vy = -Math.abs(heart.vy) * (0.5 + Math.random() * 0.2);
      }

      this.drawHeartEmoji(heart.x, heart.y, heartSize);

      if (heart.y > canvas.height + 40 && !heart.bouncing) {
        this.resetHeart(heart, canvas.width, canvas.height);
      }
    }
  }

  private resetHeart(heart: Heart, width: number, height: number): void {
    const centerX = width / 2;
    const columnWidth = width * 0.35; // Doubled to 5% of width
    heart.x = centerX + (Math.random() * columnWidth - columnWidth / 2);
    heart.y = -20;
    heart.vy = 2.2 + Math.random() * 0.7;
    heart.vx = 0;
    heart.bouncing = false;
  }

  private drawHeartEmoji(x: number, y: number, size: number): void {
    this.ctx.save();
    this.ctx.font = `${size}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
    this.ctx.fillText('❤️', x, y);
    this.ctx.restore();
  }

  private drawLargeHeart(x: number, y: number, size: number): void {
    this.ctx.save();
    this.ctx.font = `${size}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    this.ctx.fillText('❤️', x, y);
    this.ctx.restore();
  }

  private updateCurrentLyric(): void {
    if (!this.audio) return;

    // Check if lyrics have been loaded
    if (!this.lyrics || this.lyrics.length === 0) {
      console.log('Lyrics not yet loaded, skipping update');
      return;
    }

    const currentTime = this.audio.currentTime;

    // Find the correct lyric for the current time using a reverse loop for efficiency
    let foundLyric = false;
    let foundIndex = -1;

    for (let i = this.lyrics.length - 1; i >= 0; i--) {
      if (this.lyrics[i].time <= currentTime) {
        foundIndex = i;
        foundLyric = true;
        break;
      }
    }

    // Only update if the lyric changed to avoid unnecessary renders
    if (foundLyric && this.currentLyricIndex !== foundIndex) {
      console.log(
        `Changing lyric to: "${
          this.lyrics[foundIndex].text
        }" at time ${currentTime.toFixed(2)}`
      );
      this.currentLyricIndex = foundIndex;
      this.currentLyric = this.lyrics[foundIndex].text;

      // Force Angular to detect the changes
      this.cd.detectChanges();
    }

    // If we're before the first lyric or no lyric was found
    if (!foundLyric && this.lyrics.length > 0 && this.currentLyricIndex !== 0) {
      this.currentLyricIndex = 0;
      this.currentLyric = this.lyrics[0].text;
      this.cd.detectChanges();
    }
  }



  sendEmail() {
  emailjs.send(
    'service_rlqs4xu',         // e.g. service_gmail
    'template_da16nj4',        // e.g. template_reachedend
    {
      to_name: 'user',
      message: 'User reached the end stage 🎉'
    },
    'mPTdzhE5izOpk9v7h'  // From EmailJS dashboard
  ).then((response) => {
    console.log('Email sent successfully!', response.status, response.text);
  }, (err) => {
    console.error('Failed to send email:', err);
  });
}
}
