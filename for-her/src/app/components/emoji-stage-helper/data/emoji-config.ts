import { EmojiType } from '../models/emoji.model';

/**
 * Configuration for emoji types, counts, and associated text files.
 * Can be easily modified to add new emoji types or change counts.
 */
export const emojiConfig: EmojiType[] = [
  {
    emoji: '💔😨',
    count: 3,
    textFile: 'heartbreak.txt',
    collected: 0,
    allCollected: false,
    contentShown: false
  },
  {
    emoji: '🥀',
    count: 2,
    textFile: 'upset.txt',
    collected: 0,
    allCollected: false,
    contentShown: false
  },
   {
    emoji: '🫨',
    count: 2,
    textFile: 'upset.txt',
    collected: 0,
    allCollected: false,
    contentShown: false
  },
   {
    emoji: '🥺',
    count: 2,
    textFile: 'upset.txt',
    collected: 0,
    allCollected: false,
    contentShown: false
  },
  {
    emoji: '❤️‍🔥',
    count: 4,
    textFile: 'crying.txt',
    collected: 0,
    allCollected: false,
    contentShown: false
  },
];
//💔😢😞❤️‍🩹💐🥀🌹🤒🤕🥹😭
/**
 * Animation settings for floating emojis
 */
export const animationConfig = {
  minSpeed: 0.5,       // Minimum movement speed
  maxSpeed: 4,       // Maximum movement speed
  minSize: 30,         // Minimum emoji size (pixels)
  maxSize: 40,         // Maximum emoji size (pixels)
  bounceRatio: 0.8,    // Energy conservation after bounce (0-1)
  updateInterval: 16,  // Animation update interval (ms)
};

/**
 * Viewport padding to keep emojis within view
 */
export const viewportPadding = 20; // Pixels from edge
