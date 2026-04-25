export type Phase = "aiming" | "throwing" | "scored" | "gameover";

export interface FrisbeeTossState {
  phase: Phase;
  aimX: number;      // 0..1, horizontal aim oscillating
  aimDir: 1 | -1;
  aimSpeed: number;
  ringX: number;     // 0..1 target ring position
  ringY: number;     // 0..1
  frisbeeX: number;
  frisbeeY: number;
  throwT: number;    // 0..1 flight progress
  lastPoints: number;
  score: number;
  round: number;
  maxRounds: number;
}

export type FrisbeeTossAction =
  | { type: "tick"; dt: number }
  | { type: "throw" };

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function initialState(seed = 1): FrisbeeTossState {
  const rng = mulberry32(seed);
  return {
    phase: "aiming",
    aimX: 0.5,
    aimDir: 1,
    aimSpeed: 0.8 + rng() * 0.4,
    ringX: 0.2 + rng() * 0.6,
    ringY: 0.2 + rng() * 0.3,
    frisbeeX: 0.5,
    frisbeeY: 0.85,
    throwT: 0,
    lastPoints: 0,
    score: 0,
    round: 1,
    maxRounds: 8,
  };
}

export function reducer(state: FrisbeeTossState, action: FrisbeeTossAction): FrisbeeTossState {
  if (state.phase === "gameover") return state;

  switch (action.type) {
    case "tick": {
      if (state.phase === "aiming") {
        let x = state.aimX + state.aimDir * state.aimSpeed * action.dt;
        let dir = state.aimDir;
        if (x >= 1) { x = 1; dir = -1; }
        if (x <= 0) { x = 0; dir = 1; }
        return { ...state, aimX: x, aimDir: dir };
      }
      if (state.phase === "throwing") {
        const t = Math.min(state.throwT + action.dt * 1.5, 1);
        const fx = state.frisbeeX + (state.ringX - state.frisbeeX) * (t - state.throwT) * 1.5;
        const arcY = state.frisbeeY + (state.ringY - state.frisbeeY) * (t - state.throwT) * 1.5
          - Math.sin(t * Math.PI) * 0.1;
        if (t >= 1) {
          const diff = Math.abs(state.aimX - state.ringX);
          const accuracy = Math.max(0, 1 - diff * 4);
          const pts = Math.round(accuracy * 100);
          const isLast = state.round >= state.maxRounds;
          return {
            ...state,
            phase: isLast ? "gameover" : "scored",
            frisbeeX: state.ringX,
            frisbeeY: state.ringY,
            throwT: 1,
            lastPoints: pts,
            score: state.score + pts,
          };
        }
        return { ...state, throwT: t, frisbeeX: fx, frisbeeY: arcY };
      }
      return state;
    }
    case "throw": {
      if (state.phase === "aiming") {
        return { ...state, phase: "throwing", frisbeeX: state.aimX, frisbeeY: 0.85, throwT: 0 };
      }
      if (state.phase === "scored") {
        const nextRound = state.round + 1;
        const next = initialState(nextRound * 999 + 7);
        return { ...next, score: state.score, round: nextRound };
      }
      return state;
    }
    default:
      return state;
  }
}

export function isTerminal(state: FrisbeeTossState): { score: number } | null {
  if (state.phase !== "gameover") return null;
  return { score: state.score };
}
