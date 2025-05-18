export interface Heart {
  id: string;           // Unique identifier for each heart instance
  image: string;        // Path to the image to display inside the heart
  collected: boolean;   // Whether the heart has been collected
  position?: {          // Optional position for rendering
    x: number;
    y: number;
  };
  velocity?: {          // Optional velocity for animation
    x: number;
    y: number;
  };
}

export interface HeartCollection {
  totalHearts: number;      // Total number of hearts to collect
  collectedHearts: number;  // Number of hearts collected so far
  completed: boolean;       // Whether all hearts have been collected
} 