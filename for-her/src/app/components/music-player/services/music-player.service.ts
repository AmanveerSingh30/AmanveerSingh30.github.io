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
    },
    {
      title: 'The Night We Met',
      artist: 'Lord Huron',
      filename: 'night-we-met.mp3',
      coverImage: 'assets/music-cover/night-we-met-cover.jpg'
    },
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
}
