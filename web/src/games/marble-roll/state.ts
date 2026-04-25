export type Phase = "rolling" | "scored" | "gameover";

export interface MarbleRollState {
  phase: Phase;
  marbleX: number;  // 0..1
  marbleY: number;  // 0..1
  velX: number;
  velY: number;
  // Tilt controls: left/right
  tiltLeft: boolean;
  tiltRight: boolean;
  holeX: number;    // 0..1 target hole
  holeY: number;
  elapsed: number;
  timeLimit: number;
  lastPts: number;
  score: number;
  round: number;
  maxRounds: number;
}

export type MarbleRollAction =
  | { type: "tick"; dt: number }
  | { type: "tilt"; dir: "left" | "right" | "none" }
  | { type: "next" };

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function initialState(seed = 1): MarbleRollState {
  const rng = mulberry32(seed);
  return {
    phase: "rolling",
    marbleX: 0.5,
    marbleY: 0.1,
    velX: 0,
    velY: 0.05,
    tiltLeft: false,
    tiltRight: false,
    holeX: 0.2 + rng() * 0.6,
    holeY: 0.65 + rng() * 0.2,
    elapsed: 0,
    timeLimit: 8,
    lastPts: 0,
    score: 0,
    round: 1,
    maxRounds: 6,
  };
}

const GRAVITY = 0.12;
const TILT_FORCE = 0.25;
const FRICTION = 0.98;
const HOLE_R = 0.07;

export function reducer(state: MarbleRollState, action: MarbleRollAction): MarbleRollState {
  if (state.phase === "gameover") return state;

  switch (action.type) {
    case "tilt": {
      return {
        ...state,
        tiltLeft: action.dir === "left",
        tiltRight: action.dir === "right",
      };
    }

    case "tick": {
      if (state.phase !== "rolling") return state;
      const elapsed = state.elapsed + action.dt;
      if (elapsed >= state.timeLimit) {
        const isLast = state.round >= state.maxRounds;
        return { ...state, phase: isLast ? "gameover" : "scored", lastPts: 0, elapsed: state.timeLimit };
      }

      let vx = state.velX * FRICTION;
      let vy = state.velY * FRICTION + GRAVITY * action.dt;
      if (state.tiltLeft) vx -= TILT_FORCE * action.dt;
      if (state.tiltRight) vx += TILT_FORCE * action.dt;

      let mx = state.marbleX + vx * action.dt;
      let my = state.marbleY + vy * action.dt;

      // Wall bounce
      if (mx < 0.02) { mx = 0.02; vx = Math.abs(vx) * 0.6; }
      if (mx > 0.98) { mx = 0.98; vx = -Math.abs(vx) * 0.6; }
      if (my < 0.02) { my = 0.02; vy = Math.abs(vy) * 0.6; }
      if (my > 0.95) { my = 0.95; vy = -Math.abs(vy) * 0.5; }

      // Check hole
      const dx = mx - state.holeX;
      const dy = my - state.holeY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < HOLE_R) {
        const accuracy = 1 - dist / HOLE_R;
        const timeBonus = Math.round((1 - elapsed / state.timeLimit) * 50);
        const pts = Math.round(50 + accuracy * 50 + timeBonus);
        const isLast = state.round >= state.maxRounds;
        return {
          ...state,
          phase: isLast ? "gameover" : "scored",
          marbleX: state.holeX,
          marbleY: state.holeY,
          velX: 0, velY: 0,
          lastPts: pts,
          score: state.score + pts,
          elapsed,
        };
      }

      return { ...state, marbleX: mx, marbleY: my, velX: vx, velY: vy, elapsed };
    }

    case "next": {
      if (state.phase !== "scored") return state;
      const nextRound = state.round + 1;
      const next = initialState(nextRound * 137 + 41);
      return { ...next, score: state.score, round: nextRound };
    }

    default:
      return state;
  }
}

export function isTerminal(state: MarbleRollState): { score: number } | null {
  if (state.phase !== "gameover") return null;
  return { score: state.score };
}
