export const viewportPadding = 20; // Padding from viewport edges

export const animationConfig = {
  minSize: 60,           // Minimum heart size in pixels (increased)
  maxSize: 80,           // Maximum heart size in pixels (increased)
  minSpeed: 0.8,         // Minimum movement speed (px per frame) (faster)
  maxSpeed: 2.0,         // Maximum movement speed (px per frame) (faster)
  updateInterval: 20,    // Animation update interval (ms) (more frequent updates)
  bounceRatio: 0.9,      // Velocity reduction after bouncing
};

// Sample heart data configuration
export const heartsConfig = [
  {
    image: 'assets/memories/1.jpg',
  },
  {
    image: 'assets/memories/2.jpg',
  },
  {
    image: 'assets/memories/3.jpg',
  },
  {
    image: 'assets/memories/4.jpg',
  },
  {
    image: 'assets/memories/1.jpg', // Using the first image again since there's no 5th image
  },
]; 