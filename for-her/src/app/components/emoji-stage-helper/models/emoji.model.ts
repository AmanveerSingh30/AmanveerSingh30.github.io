export interface Emoji {
  id: string;          // Unique identifier for each emoji instance
  type: string;        // Emoji character or type
  collected: boolean;  // Whether the emoji has been collected
  position?: {         // Optional position for rendering
    x: number;
    y: number;
  };
  velocity?: {         // Optional velocity for animation
    x: number;
    y: number;
  };
}

export interface EmojiType {
  emoji: string;           // Emoji character
  count: number;           // Number of instances to generate
  textFile: string;        // Text file with content
  collected: number;       // Number of collected emojis
  allCollected: boolean;   // Whether all of this type are collected
  contentShown: boolean;   // Whether content popup was shown
}

export interface EmojiPopupPage {
  text: string;            // Text content for the page
  pageNumber: number;      // Page number for navigation
} 