export interface Heart {
  id: string;           // Unique identifier for each heart instance
  image: string;        // Path to the image to display inside the heart
  date?: string;        // Date metadata for the image
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
  totalHearts: number;            // Total number of hearts to collect
  collectedHearts: number;        // Number of hearts collected so far
  collectedHeartIds: string[];    // IDs of collected hearts in order of collection
  completed: boolean;             // Whether all hearts have been collected
  showFilmRoll: boolean;          // Whether to display film roll popup
  filmRollHearts: Heart[];        // Hearts to show in current film roll popup
} 