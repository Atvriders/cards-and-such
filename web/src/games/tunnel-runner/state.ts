import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TunnelSegment {
  // Each segment is a horizontal slice of the tunnel
  // left wall x (0..1) and right wall x (0..1)
  leftX: number;
  rightX: number;
}

export interface TunnelRunnerState {
  settings: { difficulty: "easy" | "normal" | "hard" };
  playerX: number;      // 0..1
  segments: TunnelSegment[];  // [0] = current row player is at; grows downward visually
  score: number;
  distance: number;
  over: boolean;
  rng: () => number;
  rngSeed: number;
  scrollSpeed: number;    // segments per second
  scrollAccum: number;    // fractional segment accumulator
  tunnelWidth: number;    // current normalized width
  targetX: number;        // tunnel center target for smooth drift
}

export type TunnelRunnerAction =
  | { type: "tick"; dt: number }
  | { type: "move"; x: number }
  | { type: "nudge"; dx: number };

const NUM_SEGMENTS = 40;
const PLAYER_W = 0.05;

function generateInitialSegments(rng: () => number, count: number, startWidth: number): TunnelSegment[] {
  const center = 0.5;
  return Array.from({ length: count }, (_, i) => {
    const w = Math.max(0.15, startWidth - i * 0.001);
    const half = w / 2;
    return { leftX: center - half, rightX: center + half };
  });
}

export function initialState(seed: number, s: { difficulty: "easy" | "normal" | "hard" }): TunnelRunnerState {
  const rng = mulberry32(seed);
  const initialWidth = s.difficulty === "easy" ? 0.55 : s.difficulty === "hard" ? 0.35 : 0.45;
  const speed = s.difficulty === "easy" ? 6 : s.difficulty === "hard" ? 12 : 9;
  return {
    settings: s,
    playerX: 0.5,
    segments: generateInitialSegments(rng, NUM_SEGMENTS, initialWidth),
    score: 0,
    distance: 0,
    over: false,
    rng,
    rngSeed: seed,
    scrollSpeed: speed,
    scrollAccum: 0,
    tunnelWidth: initialWidth,
    targetX: 0.5,
  };
}

function newSegment(rng: () => number, prevSeg: TunnelSegment, tunnelWidth: number): { seg: TunnelSegment; newTargetX: number } {
  const prevCenter = (prevSeg.leftX + prevSeg.rightX) / 2;
  // Drift center by small random amount
  const drift = (rng() - 0.5) * 0.04;
  let newCenter = Math.max(tunnelWidth / 2 + 0.02, Math.min(1 - tunnelWidth / 2 - 0.02, prevCenter + drift));
  const half = tunnelWidth / 2;
  return {
    seg: { leftX: newCenter - half, rightX: newCenter + half },
    newTargetX: newCenter,
  };
}

export function reducer(state: TunnelRunnerState, action: TunnelRunnerAction): TunnelRunnerState {
  switch (action.type) {
    case "move": {
      if (state.over) return state;
      const x = Math.max(0, Math.min(1, action.x));
      return { ...state, playerX: x };
    }

    case "nudge": {
      if (state.over) return state;
      const x = Math.max(0, Math.min(1, state.playerX + action.dx));
      return { ...state, playerX: x };
    }

    case "tick": {
      if (state.over) return state;
      const { dt } = action;

      // Scroll tunnel
      let scrollAccum = state.scrollAccum + state.scrollSpeed * dt;
      let segments = [...state.segments];
      let tunnelWidth = state.tunnelWidth;
      let targetX = state.targetX;
      const newSegsCount = Math.floor(scrollAccum);
      scrollAccum -= newSegsCount;

      for (let i = 0; i < newSegsCount; i++) {
        const last = segments[segments.length - 1]!;
        // Gradually narrow tunnel
        tunnelWidth = Math.max(0.12, tunnelWidth - 0.0005);
        const { seg, newTargetX } = newSegment(state.rng, last, tunnelWidth);
        segments.push(seg);
        targetX = newTargetX;
        segments = segments.slice(-NUM_SEGMENTS - 5);
      }

      // Player position check against the segment the player is in (roughly halfway down)
      const playerSegIdx = Math.floor(NUM_SEGMENTS * 0.75);
      const seg = segments[playerSegIdx] ?? segments[segments.length - 1]!;
      const px = state.playerX;
      const hit = px - PLAYER_W / 2 < seg.leftX || px + PLAYER_W / 2 > seg.rightX;

      const distance = state.distance + state.scrollSpeed * dt / 10;
      // Speed up over time
      const newSpeed = Math.min(state.scrollSpeed + 0.05 * dt, 30);

      return {
        ...state,
        segments,
        scrollAccum,
        tunnelWidth,
        targetX,
        distance,
        score: Math.floor(distance * 100),
        scrollSpeed: newSpeed,
        over: hit,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: TunnelRunnerState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

export { NUM_SEGMENTS, PLAYER_W };
