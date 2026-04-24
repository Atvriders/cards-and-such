// ─── Marble Drop ─────────────────────────────────────────────────────────────
// Drop marbles through pegs; they bounce and collect in scoring slots.
// Similar to plinko but with positioned pegs and visible physics simulation.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MarbleDropSettings {
  marbles: "5" | "10" | "15";
}

export interface Marble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  settled: boolean;
}

export interface Peg {
  x: number;
  y: number;
}

export interface MarbleDropState {
  settings: MarbleDropSettings;
  totalMarbles: number;
  marblesDropped: number;
  score: number;
  marbles: readonly Marble[];
  pegs: readonly Peg[];
  slotValues: readonly number[];
  lastSlot: number | null;
  over: boolean;
  rngSeed: number;
  rngCounter: number;
}

export type MarbleDropAction =
  | { type: "drop"; x: number }
  | { type: "tick"; dt: number };

const GRAVITY = 0.6;
const PEG_RADIUS = 0.025;
const MARBLE_RADIUS = 0.02;
const NUM_SLOTS = 7;
const RESTITUTION = 0.55;
const ROWS = 5;

function buildPegs(): Peg[] {
  const pegs: Peg[] = [];
  for (let row = 0; row < ROWS; row++) {
    const count = row % 2 === 0 ? 4 : 3;
    const offset = row % 2 === 0 ? 0.15 : 0.27;
    const spacing = 0.17;
    for (let i = 0; i < count; i++) {
      pegs.push({
        x: offset + i * spacing,
        y: 0.2 + row * 0.12,
      });
    }
  }
  return pegs;
}

function buildSlotValues(): number[] {
  const vals = [5, 10, 20, 50, 20, 10, 5];
  return vals;
}

export function initialState(seed: number, settings: MarbleDropSettings): MarbleDropState {
  const totalMarbles = parseInt(settings.marbles, 10);
  return {
    settings,
    totalMarbles,
    marblesDropped: 0,
    score: 0,
    marbles: [],
    pegs: buildPegs(),
    slotValues: buildSlotValues(),
    lastSlot: null,
    over: false,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: MarbleDropState, action: MarbleDropAction): MarbleDropState {
  if (state.over) return state;

  switch (action.type) {
    case "drop": {
      if (state.marblesDropped >= state.totalMarbles) return state;
      const rng = mulberry32(state.rngSeed + state.rngCounter * 7001);
      const jitter = (rng() - 0.5) * 0.04;
      const newMarble: Marble = {
        x: Math.max(0.05, Math.min(0.95, action.x + jitter)),
        y: 0.05,
        vx: (rng() - 0.5) * 0.05,
        vy: 0,
        active: true,
        settled: false,
      };
      return {
        ...state,
        marbles: [...state.marbles, newMarble],
        marblesDropped: state.marblesDropped + 1,
        rngCounter: state.rngCounter + 1,
      };
    }

    case "tick": {
      const { dt } = action;
      let scoreAdd = 0;
      let lastSlot = state.lastSlot;

      const updated = state.marbles.map((m): Marble => {
        if (!m.active || m.settled) return m;
        let { x, y, vx, vy } = m;

        vy += GRAVITY * dt;
        x += vx * dt;
        y += vy * dt;

        // Wall bounce
        if (x < MARBLE_RADIUS) { x = MARBLE_RADIUS; vx = Math.abs(vx) * RESTITUTION; }
        if (x > 1 - MARBLE_RADIUS) { x = 1 - MARBLE_RADIUS; vx = -Math.abs(vx) * RESTITUTION; }

        // Peg collisions
        for (const peg of state.pegs) {
          const dx = x - peg.x;
          const dy = y - peg.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = PEG_RADIUS + MARBLE_RADIUS;
          if (dist < minDist && dist > 0.001) {
            const nx = dx / dist;
            const ny = dy / dist;
            const dot = vx * nx + vy * ny;
            if (dot < 0) {
              vx -= (1 + RESTITUTION) * dot * nx;
              vy -= (1 + RESTITUTION) * dot * ny;
            }
            x = peg.x + nx * (minDist + 0.001);
            y = peg.y + ny * (minDist + 0.001);
          }
        }

        // Bottom: settle into slot
        if (y >= 0.88) {
          const slotIdx = Math.floor(x * NUM_SLOTS);
          const clampedSlot = Math.max(0, Math.min(NUM_SLOTS - 1, slotIdx));
          const pts = state.slotValues[clampedSlot] ?? 0;
          scoreAdd += pts;
          lastSlot = clampedSlot;
          return { x, y: 0.88, vx: 0, vy: 0, active: false, settled: true };
        }

        return { x, y, vx, vy, active: true, settled: false };
      });

      const allDone = state.marblesDropped >= state.totalMarbles &&
        updated.every(m => !m.active || m.settled);

      return {
        ...state,
        marbles: updated,
        score: state.score + scoreAdd,
        lastSlot,
        over: allDone,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: MarbleDropState): { score: number } | null {
  if (!state.over) return null;
  return { score: state.score };
}
