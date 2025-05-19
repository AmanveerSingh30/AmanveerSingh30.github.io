export const viewportPadding = 20; // Padding from viewport edges

export const animationConfig = {
  minSize: 70,           // Minimum heart size in pixels (reduced)
  maxSize: 100,          // Maximum heart size in pixels (reduced)
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
    date: '2023-02-14',
    caption: 'First Date'
  },
  // {
  //   image: 'assets/memories/2.jpg',
  //   date: '2023-03-25',
  //   caption: 'Beach Day'
  // },
  // {
  //   image: 'assets/memories/3.jpg',
  //   date: '2023-05-10',
  //   caption: 'Niagara Falls'
  // },
  // {
  //   image: 'assets/memories/4.jpg',
  //   date: '2023-06-18',
  //   caption: 'Anniversary'
  // },  // {
  //   image: 'assets/memories/1.jpg',
  //   date: '2023-07-02',
  //   caption: 'Movie Night'
  // },
  // {
  //   image: 'assets/memories/7.jpg',
  //   date: '2023-07-02',
  //   caption: 'Stargazing'
  // },
  // {
  //   image: 'assets/memories/6.jpg',
  //   date: '2023-07-09',
  //   caption: 'Sunset Walk'
  // },
  {
    image: 'assets/memories/5.jpg',
    date: '2023-07-30',
    caption: 'Candlelit Dinner'
  },
];
