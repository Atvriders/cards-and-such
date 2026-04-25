import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const MAX_LEVELS = 20;
export const PLATFORM_WIDTH = 200;

export interface TowerBuilderState {
  rngSeed: number;
  level: number;
  stackHeight: number;   // number of blocks placed
  blocks: readonly Block[];
  currentBlock: Block;
  swingDir: number;       // 1 or -1
  swingPos: number;       // 0..PLATFORM_WIDTH
  swingSpeed: number;
  phase: "swing" | "placed" | "done";
  score: number;
  log: readonly string[];
}

export interface Block {
  x: number;    // left edge position
  width: number;
}

export type TowerAction =
  | { type: "drop" }
  | { type: "nextLevel" }
  | { type: "tick" };

export function initialState(seed: number): TowerBuilderState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const baseBlock: Block = { x: 0, width: PLATFORM_WIDTH };
  const firstBlock: Block = { x: 0, width: PLATFORM_WIDTH };
  return {
    rngSeed: nextSeed,
    level: 1,
    stackHeight: 0,
    blocks: [baseBlock],
    currentBlock: firstBlock,
    swingDir: 1,
    swingPos: 0,
    swingSpeed: 8,
    phase: "swing",
    score: 0,
    log: [],
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function reducer(state: TowerBuilderState, action: TowerAction): TowerBuilderState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "tick": {
      if (state.phase !== "swing") return state;
      const newPos = state.swingPos + state.swingDir * state.swingSpeed;
      const maxEdge = PLATFORM_WIDTH - state.currentBlock.width;
      let dir = state.swingDir;
      let pos = newPos;
      if (pos >= maxEdge) { pos = maxEdge; dir = -1; }
      if (pos <= 0) { pos = 0; dir = 1; }
      return { ...state, swingPos: pos, swingDir: dir, currentBlock: { ...state.currentBlock, x: pos } };
    }

    case "drop": {
      if (state.phase !== "swing") return state;
      const topBlock = state.blocks[state.blocks.length - 1] ?? { x: 0, width: PLATFORM_WIDTH };
      const curr = state.currentBlock;

      // Calculate overlap
      const leftEdge = Math.max(curr.x, topBlock.x);
      const rightEdge = Math.min(curr.x + curr.width, topBlock.x + topBlock.width);
      const overlap = rightEdge - leftEdge;

      if (overlap <= 0) {
        // Fell off - game over
        const log = `Level ${state.level}: Block fell off! Game over.`;
        return {
          ...state,
          phase: "done",
          log: [...state.log, log],
        };
      }

      const pts = Math.round(overlap);
      const trimmed: Block = { x: leftEdge, width: overlap };
      const newBlocks = [...state.blocks, trimmed];
      const newStackHeight = state.stackHeight + 1;
      const done = newStackHeight >= MAX_LEVELS;

      // Next block starts at 0 with trimmed width
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const newSpeed = clamp(state.swingSpeed + 0.5, 4, 20);
      const log = `Level ${state.level}: overlap ${Math.round(overlap)}px → +${pts} pts`;

      const nextBlock: Block = { x: 0, width: trimmed.width };
      return {
        ...state,
        rngSeed: nextSeed,
        level: state.level + 1,
        stackHeight: newStackHeight,
        blocks: newBlocks,
        currentBlock: nextBlock,
        swingPos: 0,
        swingDir: 1,
        swingSpeed: newSpeed,
        score: state.score + pts,
        phase: done ? "done" : "placed",
        log: [...state.log, log],
      };
    }

    case "nextLevel": {
      if (state.phase !== "placed") return state;
      return { ...state, phase: "swing" };
    }
  }
}

export function isTerminal(state: TowerBuilderState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.score / (PLATFORM_WIDTH * MAX_LEVELS * 0.7)) * 100))) };
}
