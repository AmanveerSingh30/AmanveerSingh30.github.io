import { Injectable } from '@angular/core';
import { Track } from '../models/track.model';

@Injectable({
  providedIn: 'root'
})
export class MusicPlayerService {
  private emojiStageTracks: Track[] = [
    {
      title: 'Here With Me',
      artist: 'd4vd',
      filename: 'here-with-me.mp3',
      coverImage: 'assets/music-cover/here-with-me-cover.jpg'
    }
  ];

  private typewriterStageTracks: Track[] = [
    {
      title: 'Sadness and Sorrow',
      artist: 'Naruto OST',
      filename: 'sadness-and-sorrow.mp3',
      coverImage: 'assets/music-cover/sadness-sorrow-cover.jpg'
    },
    {
      title: 'Despair',
      artist: 'Naruto OST',
      filename: 'despair.mp3',
      coverImage: 'assets/music-cover/despair-cover.jpg'
    },
    {
      title: 'Loneliness',
      artist: 'Naruto OST',
      filename: 'loneliness.mp3',
      coverImage: 'assets/music-cover/loneliness-cover.jpg'
    }
  ];

  private heartStageTracks: Track[] = [
    {
      title: 'The Night We Met',
      artist: 'Lord Huron',
      filename: 'night-we-met.mp3',
      coverImage: 'assets/music-cover/night-we-met-cover.jpg'
    }
  ];

  private decisionStageTracks: Track[] = [
    {
      title: 'Phir Bhi Chaahunga',
      artist: 'Arijit Singh',
      filename: 'phir-be-chahunga.mp3',
      coverImage: 'assets/music-cover/phir-be-chahunga-cover.jpg'
    }
  ];

  constructor() { }

  getEmojiStageTracks(): Track[] {
    return this.emojiStageTracks;
  }

  getTypewriterStageTracks(): Track[] {
    return this.typewriterStageTracks;
  }

  getHeartStageTracks(): Track[] {
    return this.heartStageTracks;
  }

  getDecisionStageTracks(): Track[] {
    return this.decisionStageTracks;
  }
}
