import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Frog Leap: Lily pads appear at random positions. Frog is at a position.
// Click next lily pad to jump. Catch flies along the way for bonus pts.
// 10 jumps per game. Score based on distance jumped + fly bonus.

export interface FrogLeapSettings {
  jumps: "8" | "12" | "16";
}

export interface LilyPad {
  id: number;
  x: number;  // 0-100
  y: number;  // 0-100
}

export interface FrogLeapState {
  frog: { x: number; y: number };
  pads: LilyPad[];
  currentPad: number;   // id of current pad
  jumpsLeft: number;
  maxJumps: number;
  score: number;
  phase: "jumping" | "gameover";
  rngSeed: number;
  nextPadId: number;
}

export type FrogLeapAction =
  | { type: "jump"; padId: number };

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function initialState(seed: number, settings: FrogLeapSettings): FrogLeapState {
  const rng = mulberry32(seed);
  const maxJumps = parseInt(settings.jumps, 10);
  const pads: LilyPad[] = Array.from({ length: 6 }, (_, i) => ({
    id: i, x: Math.floor(rng() * 80) + 10, y: Math.floor(rng() * 80) + 10,
  }));
  const frog = { x: pads[0]!.x, y: pads[0]!.y };
  return { frog, pads, currentPad: 0, jumpsLeft: maxJumps, maxJumps, score: 0, phase: "jumping", rngSeed: Math.floor(rng() * 2 ** 31), nextPadId: 6 };
}

export function reducer(state: FrogLeapState, action: FrogLeapAction): FrogLeapState {
  if (state.phase === "gameover") return state;
  if (action.type === "jump") {
    const pad = state.pads.find(p => p.id === action.padId);
    if (!pad || pad.id === state.currentPad) return state;
    const d = dist(state.frog, pad);
    const pts = Math.round(d * 0.5);
    const newJumps = state.jumpsLeft - 1;
    const rng = mulberry32(state.rngSeed);
    // Refresh one random pad (not current, not jumped-to)
    const newPad: LilyPad = { id: state.nextPadId, x: Math.floor(rng() * 80) + 10, y: Math.floor(rng() * 80) + 10 };
    const pads = state.pads.filter(p => p.id !== state.currentPad).concat([newPad]);
    return { ...state, frog: { x: pad.x, y: pad.y }, pads, currentPad: pad.id, jumpsLeft: newJumps, score: state.score + pts, phase: newJumps <= 0 ? "gameover" : "jumping", rngSeed: Math.floor(rng() * 2 ** 31), nextPadId: state.nextPadId + 1 };
  }
  return state;
}

export function isTerminal(state: FrogLeapState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
