export const viewportPadding = 20; // Padding from viewport edges

export const animationConfig = {
  minSize: 80,           // Minimum heart size in pixels (increased)
  maxSize: 120,          // Maximum heart size in pixels (increased)
  minSpeed: 0.8,         // Minimum movement speed (px per frame)
  maxSpeed: 2.0,         // Maximum movement speed (px per frame)
  updateInterval: 20,    // Animation update interval (ms)
  bounceRatio: 0.9,      // Velocity reduction after bouncing
};

// Number of hearts to collect before showing film roll
export const heartsPerFilmRoll = 3;

// Sample heart data configuration
export const heartsConfig = [
  {
    image: 'assets/memories/1.jpg',
    date: '2023-02-14'
  },
  {
    image: 'assets/memories/2.jpg',
    date: '2023-03-25'
  },
  {
    image: 'assets/memories/3.jpg',
    date: '2023-05-10'
  },
  {
    image: 'assets/memories/4.jpg',
    date: '2023-06-18'
  },
  {
    image: 'assets/memories/1.jpg',
    date: '2023-07-02'
  },
]; 