import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Track } from './models/track.model';

@Component({
  selector: 'app-music-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './music-player.component.html',
  styleUrl: './music-player.component.scss'
})
export class MusicPlayerComponent implements OnInit, OnDestroy {
  @Input() tracks: Track[] = [];
  @Input() autoplay: boolean = false;

  currentTrack: Track | null = null;
  currentTrackIndex: number = 0;
  audioElement: HTMLAudioElement = new Audio();
  isPlaying: boolean = false;
  currentTime: number = 0;
  duration: number = 0;
  progressPercentage: number = 0;
  hasPrevious: boolean = false;
  hasNext: boolean = false;

  private updateTimer: any;

  ngOnInit(): void {
    this.setupAudio();

    if (this.tracks.length > 0) {
      this.currentTrackIndex = 0;
      this.loadTrack(this.currentTrackIndex);

      if (this.autoplay) {
        this.play();
      }
    }

    this.updateTimer = setInterval(() => {
      this.updateProgress();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    this.audioElement.pause();
    this.audioElement.src = '';
  }

  private setupAudio(): void {
    this.audioElement.addEventListener('ended', () => {
      if (this.hasNext) {
        this.nextTrack();
      } else {
        this.isPlaying = false;
      }
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      this.duration = this.audioElement.duration;
    });
  }

  private loadTrack(index: number): void {
    if (index >= 0 && index < this.tracks.length) {
      this.currentTrack = this.tracks[index];
      this.audioElement.src = 'assets/sounds/' + this.currentTrack.filename;
      this.audioElement.load();
      this.updateNavigationState();
    }
  }

  private updateNavigationState(): void {
    this.hasPrevious = this.currentTrackIndex > 0;
    this.hasNext = this.currentTrackIndex < this.tracks.length - 1;
  }

  private updateProgress(): void {
    if (this.audioElement && !this.audioElement.paused) {
      this.currentTime = this.audioElement.currentTime;
      this.progressPercentage = (this.currentTime / this.duration) * 100;
    }
  }

  play(): void {
    this.audioElement.play().then(() => {
      this.isPlaying = true;
    }).catch((error) => {
      console.error('Error playing audio:', error);
    });
  }

  pause(): void {
    this.audioElement.pause();
    this.isPlaying = false;
  }

  togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  nextTrack(): void {
    if (this.hasNext) {
      this.currentTrackIndex++;
      this.loadTrack(this.currentTrackIndex);

      if (this.isPlaying) {
        this.play();
      }
    }
  }

  previousTrack(): void {
    if (this.hasPrevious) {
      this.currentTrackIndex--;
      this.loadTrack(this.currentTrackIndex);

      if (this.isPlaying) {
        this.play();
      }
    }
  }

  onSeek(): void {
    // This function is called while the slider is being dragged
    this.progressPercentage = (this.currentTime / this.duration) * 100;
  }

  onSeekEnd(): void {
    // This function is called when the slider drag ends
    this.audioElement.currentTime = this.currentTime;
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) {
      return '0:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
