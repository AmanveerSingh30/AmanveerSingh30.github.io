import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Point {
  x: number;
  y: number;

  clone(): Point;
  add(o: Point): Point;
  sub(o: Point): Point;
  div(n: number): Point;
  mul(n: number): Point;
}

interface HeartFigure {
  points: Point[];
  length: number;
  get(i: number, scale?: number): Point;
}

@Component({
  selector: 'app-heart-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heart-tree.component.html',
  styleUrl: './heart-tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeartTreeComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() customText: string = '';
  @Output() openTimelineEvent = new EventEmitter<void>();
  @Output() continueEvent = new EventEmitter<void>();

  private ctx!: CanvasRenderingContext2D;
  private width: number = 1100;
  private height: number = 600;
  private seed: any;
  private footer: any;
  private tree: any;
  private hold: number = 1;
  showText: boolean = true;
  messageText: string = '';

  constructor() {}

  ngOnInit(): void {
    if (this.customText) {
      this.messageText = this.customText;
    } else {
      // Default text if no custom text is provided - with improved formatting
      this.messageText = `
        <span class="say">My princess,</span>
        <span class="say">Holding your hand, I want to walk together until our hair turns white,</span>
        <span class="say">And then tease you about having too many wrinkles.</span>
        <span class="say">I will try my best to protect the highlights of our life,</span>
        <span class="say">Your happiness is my lifelong goal,</span>
        <span class="say">Once achieved, I still want to exceed it, make you even happier everyday.</span>
        <br>
        <span class="say">Every morning, I will smile and wake you up,</span>
        <span class="say">... after stealing your blanket first.</span>
        <span class="say">Every night, I will gently say goodnight with a kiss on your forehead,</span>
        <span class="say">... and then steal the blanket again.</span>
        <br>
        <span class="say">Just like this tree (I know it dissapeared), I want to grow with you from a tiny seed of something special.</span>
<span class="say"> Every branch, every leaf, every little bloom is a part of us growing through seasons, rooted in care, and shaped like a heart because that’s what it’s always been about: love.</span>
<span class="say"> We started small, but with time, patience, and love, I believe we can become something beautiful—something that lasts (unlike this buggy tree).</span>
        <br>
        <span class="say" style="text-align: right; display: block; margin-top: 10px;">-- Yours, Prince.</span>
      `;
    }

    // Make the text-container visible on init
    setTimeout(() => {
      const textEl = document.querySelector('.text-container') as HTMLElement;
      if (textEl) {
        textEl.style.opacity = '1';
      }
    }, 1500);
  }

  ngAfterViewInit(): void {
    // Set background first - ensure strong pink gradient
    document
      .querySelector('.heart-tree-container')
      ?.setAttribute(
        'style',
        'background: linear-gradient(to bottom, #FFE6F2, #FFC1D9); height: 100vh; width: 100%;'
      );

    // Then init canvas
    this.initCanvas();
  }
  initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    // Set canvas dimensions
    canvas.width = this.width;
    canvas.height = this.height;

    // Initialize tree animation
    this.initTree();

    // Add click event handler
    canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

    // Start animation
    this.startAnimation();
  }
  initTree(): void {
    const opts = {
      seed: {
        x: this.width / 2 + 30, // Move more to the right
        color: 'rgb(190, 26, 37)',
        scale: 1.8, // Smaller seed
      },
      branch: [
        [
          535 + 30,
          680,
          570 + 30,
          250,
          500 + 30,
          200,
          25,
          100,
          [
            // Adjusted branch positions to match seed
            [
              540 + 30,
              500,
              455 + 30,
              417,
              340 + 30,
              400,
              11,
              100,
              [[450 + 30, 435, 434 + 30, 430, 394 + 30, 395, 2, 40]],
            ],
            [
              550 + 30,
              445,
              600 + 30,
              356,
              680 + 30,
              345,
              10,
              100,
              [[578 + 30, 400, 648 + 30, 409, 661 + 30, 426, 3, 80]],
            ],
            [539 + 30, 281, 537 + 30, 248, 534 + 30, 217, 3, 40],
            [
              546 + 30,
              397,
              413 + 30,
              247,
              328 + 30,
              244,
              8,
              80,
              [
                [427 + 30, 286, 383 + 30, 253, 371 + 30, 205, 2, 40],
                [498 + 30, 345, 435 + 30, 315, 395 + 30, 330, 4, 60],
              ],
            ],
            [
              546 + 30,
              357,
              608 + 30,
              252,
              678 + 30,
              221,
              5,
              100,
              [[590 + 30, 293, 646 + 30, 277, 648 + 30, 271, 2, 80]],
            ],
          ],
        ],
      ],
      bloom: {
        num: 1200,
        width: 1080,
        height: 650,
      },
      footer: {
        width: 1200,
        height: 5,
        speed: 10,
      },
    };

    this.tree = new Tree(
      this.canvasRef.nativeElement,
      this.width,
      this.height,
      opts
    );
    this.seed = this.tree.seed;
    this.footer = this.tree.footer;
  }

  handleCanvasClick(e: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.seed.hover(x, y) && this.hold === 1) {
      this.hold = 0;
      canvas.style.cursor = 'default';
      this.growTree();
    }
  }

  startAnimation(): void {
    // Draw the initial seed
    this.seed.draw();

    // Change cursor when hovering over the seed
    const canvas = this.canvasRef.nativeElement;
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      canvas.style.cursor = this.seed.hover(x, y) ? 'pointer' : 'default';
    });
  }

  async growTree(): Promise<void> {
    // Continue animation after seed is clicked
    // Scale down seed
    while (this.seed.canScale()) {
      this.seed.scale(0.95);
      await this.sleep(10);
    }

    // Move seed to ground
    while (this.seed.canMove()) {
      this.seed.move(0, 2);
      this.footer.draw();
      await this.sleep(10);
    }

    // Grow tree
    while (this.tree.canGrow()) {
      this.tree.grow();
      await this.sleep(10);
    }

    // Add flowers to fill the heart shape
    // Use the exact same approach as original code: add flowers in groups
    do {
      this.tree.flower(2); // Add 2 flowers at a time like original code
      await this.sleep(10);
    } while (this.tree.canFlower());

    // No tree movement - keep it stationary where it grew

    // Show text immediately after tree animation completes
    await this.sleep(300);
    const textEl = document.querySelector('.text-container') as HTMLElement;
    if (textEl) {
      textEl.classList.add('visible');
    }

    // Start flower animation with same approach as original code
    this.animateFlowers();
  }

  animateFlowers(): void {
    const animate = () => {
      // Clear entire canvas and redraw everything
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Draw the tree and branches
      this.drawTreeBase();

      // Animate hearts like in original code
      this.tree.jump();

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  // New method to draw the static tree without clearing everything
  drawTreeBase(): void {
    // Don't clear the whole canvas
    // Just draw the branches which are static

    // Draw footer (ground line)
    this.footer.draw();

    // Redraw all branches to ensure they're visible
    for (let branch of this.tree.branchs) {
      if (branch) {
        branch.redraw();
      }
    }
  }

  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  openTimeline(): void {
    this.openTimelineEvent.emit();
  }

  continueToNextStage(): void {
    this.continueEvent.emit();
  }
}

// Point class implementation
class Point {
  constructor(public x: number = 0, public y: number = 0) {}

  clone(): Point {
    return new Point(this.x, this.y);
  }

  add(o: Point): Point {
    const p = this.clone();
    p.x += o.x;
    p.y += o.y;
    return p;
  }

  sub(o: Point): Point {
    const p = this.clone();
    p.x -= o.x;
    p.y -= o.y;
    return p;
  }

  div(n: number): Point {
    const p = this.clone();
    p.x /= n;
    p.y /= n;
    return p;
  }

  mul(n: number): Point {
    const p = this.clone();
    p.x *= n;
    p.y *= n;
    return p;
  }
}

// Heart class implementation to create more pronounced heart shapes
class Heart {
  points: Point[] = [];
  length: number = 0;

  constructor() {
    let points: Point[] = [];
    let x: number, y: number, t: number;

    // Use the exact same formula and step value as in the original code
    for (let i = 10; i < 30; i += 0.2) {
      t = i / Math.PI;
      x = 14 * Math.pow(Math.sin(t), 3); // Reduced from 16 to make heart shape smaller
      y =
        11 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t); // Reduced from 13 to make heart shape smaller
      points.push(new Point(x, y));
    }

    this.points = points;
    this.length = points.length;
  }

  get(i: number, scale: number = 1): Point {
    return this.points[i].mul(scale);
  }
}

// Seed class implementation
class Seed {
  heart: {
    point: Point;
    scale: number;
    color: string;
    figure: Heart;
  };

  cirle: {
    point: Point;
    scale: number;
    color: string;
    radius: number;
  };

  tree: any;

  constructor(
    tree: any,
    point: Point,
    scale: number = 1,
    color: string = '#FF0000'
  ) {
    this.tree = tree;
    this.heart = {
      point: point,
      scale: scale,
      color: color,
      figure: new Heart(),
    };
    this.cirle = {
      point: point,
      scale: scale,
      color: color,
      radius: 5,
    };
  }

  draw(): void {
    this.drawHeart();
    this.drawText();
  }

  addPosition(x: number, y: number): void {
    this.cirle.point = this.cirle.point.add(new Point(x, y));
  }

  canMove(): boolean {
    return this.cirle.point.y < this.tree.height + 20;
  }

  move(x: number, y: number): void {
    this.clear();
    this.drawCirle();
    this.addPosition(x, y);
  }

  canScale(): boolean {
    return this.heart.scale > 0.2;
  }

  setHeartScale(scale: number): void {
    this.heart.scale *= scale;
  }

  scale(scale: number): void {
    this.clear();
    this.drawCirle();
    this.drawHeart();
    this.setHeartScale(scale);
  }

  drawHeart(): void {
    const ctx = this.tree.ctx;
    const heart = this.heart;
    const point = heart.point;
    const color = heart.color;
    const scale = heart.scale;

    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(point.x, point.y);
    ctx.beginPath();
    ctx.moveTo(0, 0);

    for (let i = 0; i < heart.figure.length; i++) {
      const p = heart.figure.get(i, scale);
      ctx.lineTo(p.x, -p.y);
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawCirle(): void {
    const ctx = this.tree.ctx;
    const cirle = this.cirle;
    const point = cirle.point;
    const color = cirle.color;
    const scale = cirle.scale;
    const radius = cirle.radius;

    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(point.x, point.y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  drawText(): void {
    const ctx = this.tree.ctx;
    const heart = this.heart;
    const point = heart.point;
    const color = heart.color;
    const scale = heart.scale;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.translate(point.x, point.y);
    ctx.scale(scale, scale);
    ctx.moveTo(0, 0);
    ctx.lineTo(15, 15);
    ctx.lineTo(60, 15);
    ctx.stroke();

    ctx.moveTo(0, 0);
    ctx.scale(0.75, 0.75);
    ctx.font = '12px 微软雅黑,Verdana';
    ctx.fillText('click here', 28, 16); // Moved text to the right (from 23 to 28)
    ctx.restore();
  }

  clear(): void {
    const ctx = this.tree.ctx;
    const cirle = this.cirle;
    const point = cirle.point;
    const scale = cirle.scale;
    const radius = 26;

    const w = radius * scale;
    const h = w;
    ctx.clearRect(point.x - w, point.y - h, 4 * w, 4 * h);
  }

  hover(x: number, y: number): boolean {
    const ctx = this.tree.ctx;
    const pixel = ctx.getImageData(x, y, 1, 1);
    return pixel.data[3] == 255;
  }
}

// Footer class implementation
class Footer {
  tree: any;
  point: Point;
  width: number;
  height: number;
  speed: number;
  length: number = 0;
  constructor(tree: any, width: number, height: number, speed: number = 2) {
    this.tree = tree;
    this.point = new Point(tree.seed.heart.point.x, tree.height - height / 2);
    this.width = width;
    this.height = height;
    this.speed = speed;
  }

  draw(): void {
    const ctx = this.tree.ctx;
    const point = this.point;
    const len = this.length / 2;

    ctx.save();
    ctx.strokeStyle = 'rgb(35, 31, 32)';
    ctx.lineWidth = this.height;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.translate(point.x, point.y);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, 0);
    ctx.lineTo(-len, 0);
    ctx.stroke();
    ctx.restore();

    if (this.length < this.width) {
      this.length += this.speed;
    }
  }
}

// Branch class implementation
class Branch {
  tree: any;
  point1: Point;
  point2: Point;
  point3: Point;
  radius: number;
  length: number;
  len: number = 0;
  t: number;
  branchs: any[];

  constructor(
    tree: any,
    point1: Point,
    point2: Point,
    point3: Point,
    radius: number,
    length: number = 100,
    branchs: any[] = []
  ) {
    this.tree = tree;
    this.point1 = point1;
    this.point2 = point2;
    this.point3 = point3;
    this.radius = radius;
    this.length = length;
    this.t = 1 / (this.length - 1);
    this.branchs = branchs;
  }

  grow(): void {
    const s = this;
    let p: Point;

    if (s.len <= s.length) {
      p = bezier([s.point1, s.point2, s.point3], s.len * s.t);
      s.draw(p);
      s.len += 1;
      s.radius *= 0.97;
    } else {
      s.tree.removeBranch(s);
      s.tree.addBranchs(s.branchs);
    }
  }

  draw(p: Point): void {
    const s = this;
    const ctx = s.tree.ctx;

    ctx.save();
    ctx.beginPath();
    // Use pure black for the trunk and branches like in the reference image
    ctx.fillStyle = '#000000'; // Black
    ctx.shadowColor = '#000000'; // Black shadow
    ctx.shadowBlur = 2;
    ctx.moveTo(p.x, p.y);
    ctx.arc(p.x, p.y, s.radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  redraw(): void {
    const s = this;
    // For completed branches, we need to redraw the final state
    if (s.len >= s.length) {
      const p = bezier([s.point1, s.point2, s.point3], 1.0); // Draw the final position
      s.draw(p);
    }
  }
}

// Bloom class implementation
class Bloom {
  tree: any;
  point: Point;
  color: string;
  alpha: number;
  angle: number;
  scale: number;
  place: Point;
  speed: number;
  figure: any;

  constructor(
    tree: any,
    point: Point,
    figure: any,
    color?: string,
    alpha?: number,
    angle?: number,
    scale?: number,
    place?: Point,
    speed?: number
  ) {
    this.tree = tree;
    this.point = point;

    // Use pink/red/orange/yellow hues for the hearts to match the reference image
    // If no color provided, use a random color from our palette
    if (!color) {
      const heartColors = [
        'rgb(255, 20, 147)', // Deep pink
        'rgb(255, 105, 180)', // Hot pink
        'rgb(255, 182, 193)', // Light pink
        'rgb(255, 0, 0)', // Red
        'rgb(255, 69, 0)', // Red-orange
        'rgb(255, 165, 0)', // Orange
        'rgb(255, 215, 0)', // Gold
        'rgb(255, 255, 0)', // Yellow
      ];
      color = heartColors[Math.floor(Math.random() * heartColors.length)];
    }
    this.color = color;

    this.alpha = alpha ?? random(0.7, 1.0); // High opacity but not fully opaque
    this.angle = angle ?? random(0, 360);
    this.scale = scale ?? random(0.1, 0.25); // Smaller scale to match image
    this.place = place ?? point;
    this.speed = speed ?? 1;
    this.figure = figure;
  }

  draw(): void {
    const s = this;
    const ctx = s.tree.ctx;
    const figure = s.figure;

    ctx.save();

    // Add subtle shadow for depth but not too much
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Simple fill instead of gradient for a cleaner look like in the image
    ctx.fillStyle = s.color;
    ctx.globalAlpha = s.alpha;
    ctx.translate(s.point.x, s.point.y);
    ctx.scale(s.scale, s.scale); // No pulsing
    ctx.rotate(s.angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);

    for (let i = 0; i < figure.length; i++) {
      const p = figure.get(i);
      ctx.lineTo(p.x, -p.y);
    }

    ctx.closePath();
    ctx.fill();

    // Remove the stroke - most hearts in the image don't have visible outlines

    ctx.restore();
  }

  // New method for minimal update - just small rotation to give some life
  // without disturbing the heart shape
  updateMinimal(): void {
    // Just redraw with slight rotation
    this.angle += random(-0.01, 0.01); // Very small angle change
    this.draw();
  }

  jump(): void {
    const s = this;
    const height = s.tree.height;

    // Follow original implementation
    if (s.point.x < -20 || s.point.y > height + 20) {
      s.tree.removeBloom(s);
    } else {
      s.draw();
      s.point = s.place.sub(s.point).div(s.speed).add(s.point);
      s.angle += 0.05;
      s.speed -= 1;
    }
  }

  flower(): void {
    const s = this;
    s.draw();
    s.scale += 0.1;
    if (s.scale > 1) {
      s.tree.removeBloom(s);
    }
  }
}

// Tree class implementation
class Tree {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  opt: any;
  record: any = {};
  seed!: Seed;
  footer!: Footer;
  branchs: Branch[] = [];
  blooms: Bloom[] = [];
  bloomsCache: Bloom[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    opt: any = {}
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = width;
    this.height = height;
    this.opt = opt;

    this.initSeed();
    this.initFooter();
    this.initBranch();
    this.initBloom();
  }

  initSeed(): void {
    const seed = this.opt.seed || {};
    const x = seed.x || this.width / 2;
    const y = seed.y || this.height / 2;
    const point = new Point(x, y);
    const color = seed.color || '#FF0000';
    const scale = seed.scale || 1;

    this.seed = new Seed(this, point, scale, color);
  }

  initFooter(): void {
    const footer = this.opt.footer || {};
    const width = footer.width || this.width;
    const height = footer.height || 5;
    const speed = footer.speed || 2;
    this.footer = new Footer(this, width, height, speed);
  }

  initBranch(): void {
    const branchs = this.opt.branch || [];
    this.branchs = [];
    this.addBranchs(branchs);
  }
  initBloom(): void {
    const bloom = this.opt.bloom || {};
    const cache: Bloom[] = [];
    const num = bloom.num || 700; // Use 700 like the original code
    const width = bloom.width || this.width;
    const height = bloom.height || this.height;
    const figure = this.seed.heart.figure;
    const r = 180; // Further reduced radius to make heart shape even smaller
    const xOffset = 20; // Shift the heart shape to the right

    // Create the bloom cache exactly like in original code
    for (let i = 0; i < num; i++) {
      cache.push(
        this.createBloom(
          width,
          height,
          r,
          figure,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          xOffset
        )
      );
    }

    this.blooms = [];
    this.bloomsCache = cache;
  }

  toDataURL(type: string): string {
    return this.canvas.toDataURL(type);
  }

  draw(k: string): void {
    const s = this;
    const ctx = s.ctx;
    const rec = s.record[k];

    if (!rec) {
      return;
    }

    const point = rec.point;
    const image = rec.image;

    ctx.save();
    ctx.putImageData(image, point.x, point.y);
    ctx.restore();
  }

  addBranch(branch: Branch): void {
    this.branchs.push(branch);
  }

  addBranchs(branchs: any[]): void {
    const s = this;
    let b, p1, p2, p3, r, l, c;

    for (let i = 0; i < branchs.length; i++) {
      b = branchs[i];
      p1 = new Point(b[0], b[1]);
      p2 = new Point(b[2], b[3]);
      p3 = new Point(b[4], b[5]);
      r = b[6];
      l = b[7];
      c = b[8];
      s.addBranch(new Branch(s, p1, p2, p3, r, l, c));
    }
  }

  removeBranch(branch: Branch): void {
    const branchs = this.branchs;
    for (let i = 0; i < branchs.length; i++) {
      if (branchs[i] === branch) {
        branchs.splice(i, 1);
        break;
      }
    }
  }

  canGrow(): boolean {
    return !!this.branchs.length;
  }

  grow(): void {
    const branchs = this.branchs;
    for (let i = 0; i < branchs.length; i++) {
      const branch = branchs[i];
      if (branch) {
        branch.grow();
      }
    }
  }

  addBloom(bloom: Bloom): void {
    this.blooms.push(bloom);
  }

  removeBloom(bloom: Bloom): void {
    const blooms = this.blooms;
    for (let i = 0; i < blooms.length; i++) {
      if (blooms[i] === bloom) {
        blooms.splice(i, 1);
        break;
      }
    }
  }
  createBloom(
    width: number,
    height: number,
    radius: number,
    figure: any,
    color?: string,
    alpha?: number,
    angle?: number,
    scale?: number,
    place?: Point,
    speed?: number,
    xOffset: number = 0
  ): Bloom {
    if (place) {
      // For hearts at specified positions (floating hearts)
      return new Bloom(
        this,
        place,
        figure,
        color,
        alpha,
        angle,
        scale,
        place,
        speed
      );
    } else {
      // Use the original algorithm from html.txt to position hearts in a heart shape
      let x, y;

      // Use the exact same approach as the original code - keep trying until finding a point in the heart
      while (true) {
        x = random(20, width - 20);
        y = random(20, height - 20);

        // This is the exact formula from the original code - positions hearts in a heart shape
        // Apply xOffset to shift the heart shape to the right
        if (
          inheart(
            x - width / 2 - xOffset,
            height - (height - 40) / 2 - y,
            radius
          )
        ) {
          // Use colors that match the reference image
          const heartColors = [
            'rgb(255, 20, 147)', // Deep pink
            'rgb(255, 105, 180)', // Hot pink
            'rgb(255, 0, 0)', // Red
            'rgb(255, 69, 0)', // Red-orange
            'rgb(255, 165, 0)', // Orange
            'rgb(255, 215, 0)', // Gold
          ];

          const heartColor =
            color ||
            heartColors[Math.floor(Math.random() * heartColors.length)];
          const initialScale = scale ?? random(0.1, 0.25); // Smaller scale like in reference
          const heartAlpha = alpha ?? random(0.7, 1.0); // High opacity

          return new Bloom(
            this,
            new Point(x, y),
            figure,
            heartColor,
            heartAlpha,
            angle,
            initialScale,
            undefined,
            speed
          );
        }
      }
    }
  }

  canFlower(): boolean {
    return !!this.blooms.length;
  }

  flower(num: number): void {
    const s = this;
    // Take hearts from the cache - these are pre-positioned in a heart shape
    const blooms = s.bloomsCache.splice(0, num);

    // Add them to the active blooms
    for (let i = 0; i < blooms.length; i++) {
      s.addBloom(blooms[i]);
    }

    // Animate the flowers
    const flowers = s.blooms;
    for (let j = 0; j < flowers.length; j++) {
      flowers[j].flower();
    }
  }

  snapshot(
    k: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const ctx = this.ctx;
    const image = ctx.getImageData(x, y, width, height);
    this.record[k] = {
      image: image,
      point: new Point(x, y),
      width: width,
      height: height,
    };
  }

  setSpeed(k: string | undefined, speed: number): void {
    this.record[k || 'move'].speed = speed;
  }

  move(k: string | undefined, x: number, y: number): boolean {
    const s = this;
    const ctx = s.ctx;
    const rec = s.record[k || 'move'];

    const point = rec.point;
    const image = rec.image;
    const speed = rec.speed || 10;
    const width = rec.width;
    const height = rec.height;

    const i = point.x + speed < x ? point.x + speed : x;
    const j = point.y + speed < y ? point.y + speed : y;

    ctx.save();
    ctx.clearRect(point.x, point.y, width, height);
    ctx.putImageData(image, i, j);
    ctx.restore();

    rec.point = new Point(i, j);
    rec.speed = speed * 0.95;

    if (rec.speed < 2) {
      rec.speed = 2;
    }

    return i < x || j < y;
  }

  jump(): void {
    const s = this;
    const blooms = s.blooms;

    // Update all hearts
    if (blooms.length) {
      for (let i = 0; i < blooms.length; i++) {
        blooms[i].jump();
      }
    }

    // Add new hearts occasionally - like in original code
    if ((blooms.length && blooms.length < 3) || !blooms.length) {
      const bloom = this.opt.bloom || {};
      const width = bloom.width || this.width;
      const height = bloom.height || this.height;
      const figure = this.seed.heart.figure;
      const r = 180; // Further reduced radius from 200 to 180 for an even smaller heart shape
      const xOffset = 20; // Add xOffset to shift the heart to the right

      // Add 1-2 blooms from the right side with proper arguments
      for (let i = 0; i < random(1, 2); i++) {
        blooms.push(
          this.createBloom(
            width / 2 + width,
            height,
            r,
            figure,
            undefined, // color
            1,
            undefined, // angle
            1,
            new Point(random(-100, 600), 720),
            random(200, 300),
            xOffset // Pass the xOffset here too for consistent positioning
          )
        );
      }
    }
  }
}

// Bezier curve function
function bezier(cp: Point[], t: number): Point {
  const p1 = cp[0].mul((1 - t) * (1 - t));
  const p2 = cp[1].mul(2 * t * (1 - t));
  const p3 = cp[2].mul(t * t);
  return p1.add(p2).add(p3);
}

// Random number generator function
function random(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// First, fix the inheart function to match the original code
function inheart(x: number, y: number, r: number): boolean {
  // Heart equation from the original code
  const z =
    ((x / r) * (x / r) + (y / r) * (y / r) - 1) *
      ((x / r) * (x / r) + (y / r) * (y / r) - 1) *
      ((x / r) * (x / r) + (y / r) * (y / r) - 1) -
    (x / r) * (x / r) * (y / r) * (y / r) * (y / r);
  return z < 0;
}
