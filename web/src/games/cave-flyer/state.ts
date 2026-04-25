import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CaveFlyerSettings {
  speed: "slow" | "medium" | "fast";
}

export interface CaveSegment {
  x: number;
  topY: number;
  botY: number;
}

export interface CaveFlyerState {
  settings: CaveFlyerSettings;
  playerY: number;
  playerVy: number;
  thrusting: boolean;
  segments: readonly CaveSegment[];
  score: number;
  over: boolean;
  rngSeed: number;
  rngCounter: number;
}

export type CaveFlyerAction =
  | { type: "tick"; dt: number }
  | { type: "thrust"; on: boolean };

const GRAVITY = 0.9;
const THRUST = -1.8;
const SEG_WIDTH = 0.04;
const CAVE_GAP = 0.38;

function speedScale(s: CaveFlyerSettings["speed"]): number {
  return s === "slow" ? 0.7 : s === "fast" ? 1.4 : 1.0;
}

function rngAt(seed: number, counter: number): number {
  return mulberry32(seed + counter * 997661)();
}

function generateSegment(seed: number, counter: number, prevTop: number, prevBot: number): { seg: CaveSegment; counter: number } {
  const drift = (rngAt(seed, counter++) - 0.5) * 0.04;
  const topY = Math.max(0.02, Math.min(1 - CAVE_GAP - 0.02, prevTop + drift));
  const botY = topY + CAVE_GAP;
  const x = 0; // will be positioned by index
  return { seg: { x, topY, botY }, counter };
}

const NUM_SEGMENTS = 30;

export function initialState(seed: number, settings: CaveFlyerSettings): CaveFlyerState {
  let counter = 0;
  const segments: CaveSegment[] = [];
  let topY = 0.1;
  let botY = topY + CAVE_GAP;
  for (let i = 0; i < NUM_SEGMENTS; i++) {
    segments.push({ x: i * SEG_WIDTH, topY, botY });
    const result = generateSegment(seed, counter, topY, botY);
    topY = result.seg.topY;
    botY = result.seg.botY;
    counter = result.counter;
  }
  return {
    settings,
    playerY: 0.5,
    playerVy: 0,
    thrusting: false,
    segments,
    score: 0,
    over: false,
    rngSeed: seed,
    rngCounter: counter,
  };
}

export function reducer(state: CaveFlyerState, action: CaveFlyerAction): CaveFlyerState {
  if (state.over) return state;

  switch (action.type) {
    case "thrust":
      return { ...state, thrusting: action.on };

    case "tick": {
      const { dt } = action;
      const sf = speedScale(state.settings.speed);

      // Physics
      const accel = state.thrusting ? THRUST : GRAVITY;
      const vy = state.playerVy + accel * dt * sf;
      const py = Math.max(0, Math.min(1, state.playerY + vy * dt * sf));

      // Scroll segments left
      const SCROLL_SPEED = sf * 0.25;
      let segments: CaveSegment[] = state.segments.map((s) => ({ ...s, x: s.x - SCROLL_SPEED * dt }));

      // Remove off-screen and add new ones
      let counter = state.rngCounter;
      const filtered = segments.filter((s) => s.x > -SEG_WIDTH * 2);
      const rightmost = Math.max(...filtered.map((s) => s.x));
      while (filtered.length < NUM_SEGMENTS) {
        const last = filtered[filtered.length - 1]!;
        const result = generateSegment(state.rngSeed, counter, last.topY, last.botY);
        result.seg.x = rightmost + SEG_WIDTH * (filtered.length - segments.length + 1);
        filtered.push(result.seg);
        counter = result.counter;
      }
      segments = filtered;

      // Collision: find segment at player position (x ~ 0.15)
      const PLAYER_X = 0.15;
      let over = false;
      for (const seg of segments) {
        if (Math.abs(seg.x - PLAYER_X) < SEG_WIDTH) {
          if (py <= seg.topY + 0.02 || py >= seg.botY - 0.02) {
            over = true;
          }
        }
      }

      const score = over ? state.score : state.score + 1;

      return {
        ...state,
        playerY: py,
        playerVy: vy,
        segments,
        score,
        over,
        rngCounter: counter,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CaveFlyerState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
