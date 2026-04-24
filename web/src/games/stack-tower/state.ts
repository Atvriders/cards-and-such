import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Block {
  x: number;  // left edge, 0..1
  width: number; // 0..1
  color: string;
}

export interface StackTowerState {
  settings: { speed: "slow" | "normal" | "fast" };
  stack: Block[];      // settled blocks, bottom to top
  moving: Block & { dir: 1 | -1 }; // current sliding block
  score: number;
  over: boolean;
  rng: () => number;
  rngSeed: number;
  moveSpeed: number;
  blockColors: string[];
}

export type StackTowerAction =
  | { type: "tick"; dt: number }
  | { type: "drop" };

const COLORS = [
  "#e05050", "#e08030", "#d0c030", "#50b050",
  "#4090d0", "#8050c0", "#d050a0", "#50c0c0",
];

function nextColor(rng: () => number): string {
  return COLORS[Math.floor(rng() * COLORS.length)]!;
}

function makeMovingBlock(rng: () => number, width: number, speed: number): Block & { dir: 1 | -1 } {
  const startLeft = rng() < 0.5;
  return {
    x: startLeft ? -width : 1.0,
    width,
    color: nextColor(rng),
    dir: startLeft ? 1 : -1,
  };
}

export function initialState(seed: number, s: { speed: "slow" | "normal" | "fast" }): StackTowerState {
  const speedMult = s.speed === "slow" ? 0.5 : s.speed === "fast" ? 1.8 : 1.0;
  const rng = mulberry32(seed);
  const baseBlock: Block = { x: 0.1, width: 0.8, color: nextColor(rng) };
  const moving = makeMovingBlock(rng, 0.8, 0.4 * speedMult);
  return {
    settings: s,
    stack: [baseBlock],
    moving,
    score: 0,
    over: false,
    rng,
    rngSeed: seed,
    moveSpeed: 0.4 * speedMult,
    blockColors: COLORS,
  };
}

export function reducer(state: StackTowerState, action: StackTowerAction): StackTowerState {
  switch (action.type) {
    case "tick": {
      if (state.over) return state;
      const { dt } = action;
      const m = state.moving;
      let newX = m.x + m.dir * state.moveSpeed * dt;
      let dir = m.dir;
      if (newX > 1.0) { newX = 1.0; dir = -1; }
      if (newX + m.width < 0) { newX = -m.width; dir = 1; }
      return { ...state, moving: { ...m, x: newX, dir } };
    }

    case "drop": {
      if (state.over) return state;
      const top = state.stack[state.stack.length - 1]!;
      const m = state.moving;

      // Compute overlap
      const overlapLeft = Math.max(m.x, top.x);
      const overlapRight = Math.min(m.x + m.width, top.x + top.width);
      const overlapWidth = overlapRight - overlapLeft;

      if (overlapWidth <= 0) {
        // Completely missed — game over
        return { ...state, over: true };
      }

      const newBlock: Block = { x: overlapLeft, width: overlapWidth, color: m.color };
      const newStack = [...state.stack, newBlock];

      // Increase speed slightly each level
      const newSpeed = Math.min(state.moveSpeed * 1.05, 2.0);
      const nextMoving = makeMovingBlock(state.rng, overlapWidth, newSpeed);

      return {
        ...state,
        stack: newStack,
        moving: nextMoving,
        score: state.score + Math.round(overlapWidth * 100),
        moveSpeed: newSpeed,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: StackTowerState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
