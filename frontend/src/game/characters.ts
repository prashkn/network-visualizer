import * as ex from "excalibur";

import adamRunUrl from "../assets/Characters_free/Adam_run_16x16.png";
import adamIdleUrl from "../assets/Characters_free/Adam_idle_anim_16x16.png";
import alexRunUrl from "../assets/Characters_free/Alex_run_16x16.png";
import alexIdleUrl from "../assets/Characters_free/Alex_idle_anim_16x16.png";
import ameliaRunUrl from "../assets/Characters_free/Amelia_run_16x16.png";
import ameliaIdleUrl from "../assets/Characters_free/Amelia_idle_anim_16x16.png";
import bobRunUrl from "../assets/Characters_free/Bob_run_16x16.png";
import bobIdleUrl from "../assets/Characters_free/Bob_idle_anim_16x16.png";

const FRAME_W = 16;
const FRAME_H = 32;
const FRAMES_PER_DIR = 6;
const SCALE = 3;
const WALK_SPEED = 60;
const MARGIN = 40;

interface CharSheet {
  run: ex.ImageSource;
  idle: ex.ImageSource;
}

const CHAR_SHEETS: CharSheet[] = [
  { run: new ex.ImageSource(adamRunUrl, { filtering: ex.ImageFiltering.Pixel }), idle: new ex.ImageSource(adamIdleUrl, { filtering: ex.ImageFiltering.Pixel }) },
  { run: new ex.ImageSource(alexRunUrl, { filtering: ex.ImageFiltering.Pixel }), idle: new ex.ImageSource(alexIdleUrl, { filtering: ex.ImageFiltering.Pixel }) },
  { run: new ex.ImageSource(ameliaRunUrl, { filtering: ex.ImageFiltering.Pixel }), idle: new ex.ImageSource(ameliaIdleUrl, { filtering: ex.ImageFiltering.Pixel }) },
  { run: new ex.ImageSource(bobRunUrl, { filtering: ex.ImageFiltering.Pixel }), idle: new ex.ImageSource(bobIdleUrl, { filtering: ex.ImageFiltering.Pixel }) },
];

export const charLoader = new ex.Loader(
  CHAR_SHEETS.flatMap((s) => [s.run, s.idle])
);
charLoader.suppressPlayButton = true;

type Dir = "down" | "right" | "up" | "left";
const DIR_ROW: Record<Dir, number> = { down: 0, right: 1, up: 2, left: 3 };

function makeSpriteSheet(image: ex.ImageSource): ex.SpriteSheet {
  return ex.SpriteSheet.fromImageSource({
    image,
    grid: { columns: 24, rows: 1, spriteWidth: FRAME_W, spriteHeight: FRAME_H },
  });
}

function dirAnim(sheet: ex.SpriteSheet, dirIndex: number, speed: number): ex.Animation {
  const start = dirIndex * FRAMES_PER_DIR;
  const frames = [];
  for (let i = 0; i < FRAMES_PER_DIR; i++) {
    frames.push({ graphic: sheet.getSprite(start + i, 0)!, duration: speed });
  }
  return new ex.Animation({ frames, strategy: ex.AnimationStrategy.Loop });
}

export class DeviceCharacter extends ex.Actor {
  private targetX = 0;
  private targetY = 0;
  private idleTimer = 0;
  private state: "walking" | "idle" = "idle";
  private runSheet: ex.SpriteSheet;
  private idleSheet: ex.SpriteSheet;
  private anims: Record<string, ex.Animation> = {};
  private bounds: { w: number; h: number } = { w: 800, h: 600 };

  deviceName: string;

  constructor(name: string, sheetIndex: number) {
    super({
      x: MARGIN + Math.random() * (800 - MARGIN * 2),
      y: MARGIN + Math.random() * (600 - MARGIN * 2),
      width: FRAME_W * SCALE,
      height: FRAME_H * SCALE,
      anchor: ex.vec(0.5, 0.5),
      z: 1,
    });

    this.deviceName = name;

    const idx = sheetIndex % CHAR_SHEETS.length;
    this.runSheet = makeSpriteSheet(CHAR_SHEETS[idx].run);
    this.idleSheet = makeSpriteSheet(CHAR_SHEETS[idx].idle);

    for (const [dir, row] of Object.entries(DIR_ROW)) {
      this.anims[`run_${dir}`] = dirAnim(this.runSheet, row, 100);
      this.anims[`run_${dir}`].scale = ex.vec(SCALE, SCALE);
      this.anims[`idle_${dir}`] = dirAnim(this.idleSheet, row, 200);
      this.anims[`idle_${dir}`].scale = ex.vec(SCALE, SCALE);
    }

    const label = new ex.Label({
      text: name,
      pos: ex.vec(0, -FRAME_H * SCALE / 2 - 14),
      anchor: ex.vec(0.5, 0.5),
      font: new ex.Font({
        family: "monospace",
        size: 12,
        bold: true,
        color: ex.Color.White,
        textAlign: ex.TextAlign.Center,
        shadow: { offset: ex.vec(1, 1), color: ex.Color.Black, blur: 2 },
      }),
      z: 10,
    });

    this.addChild(label);
  }

  onInitialize(): void {
    this.graphics.use(this.anims["idle_down"]);
    this.pickNewTarget();
    this.idleTimer = 1 + Math.random() * 3;
  }

  setBounds(w: number, h: number) {
    this.bounds = { w, h };
  }

  private pickNewTarget() {
    this.targetX = MARGIN + Math.random() * (this.bounds.w - MARGIN * 2);
    this.targetY = MARGIN + Math.random() * (this.bounds.h - MARGIN * 2);
  }

  private getDirection(dx: number, dy: number): Dir {
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? "right" : "left";
    }
    return dy > 0 ? "down" : "up";
  }

  onPreUpdate(_engine: ex.Engine, delta: number): void {
    const dt = delta / 1000;

    if (this.state === "idle") {
      this.idleTimer -= dt;
      if (this.idleTimer <= 0) {
        this.pickNewTarget();
        this.state = "walking";
      }
    }

    if (this.state === "walking") {
      const dx = this.targetX - this.pos.x;
      const dy = this.targetY - this.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 5) {
        this.state = "idle";
        this.idleTimer = 2 + Math.random() * 6;
        const dir = this.getDirection(dx, dy);
        this.graphics.use(this.anims[`idle_${dir}`]);
        this.vel = ex.vec(0, 0);
        return;
      }

      const dir = this.getDirection(dx, dy);
      this.graphics.use(this.anims[`run_${dir}`]);
      this.vel = ex.vec((dx / dist) * WALK_SPEED, (dy / dist) * WALK_SPEED);
    }
  }
}
