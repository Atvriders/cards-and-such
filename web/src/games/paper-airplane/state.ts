export type Phase = "aiming" | "flying" | "landed" | "gameover";

export interface PaperAirplaneState {
  phase: Phase;
  angle: number;       // launch angle degrees (0=horizontal, 90=up)
  angleDir: 1 | -1;
  planeX: number;      // 0..1 fraction of field width
  planeY: number;      // 0..1 fraction of field height (0=top)
  velX: number;
  velY: number;
  targetX: number;    // 0..1
  distanceScore: number;
  score: number;
  round: number;
  maxRounds: number;
}

export type PaperAirplaneAction =
  | { type: "tick"; dt: number }
  | { type: "launch" };

const GRAVITY = 0.18;
const ANGLE_SPEED = 45; // degrees per second

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function initialState(seed = 42): PaperAirplaneState {
  const rng = mulberry32(seed);
  return {
    phase: "aiming",
    angle: 20,
    angleDir: 1,
    planeX: 0.05,
    planeY: 0.7,
    velX: 0,
    velY: 0,
    targetX: 0.5 + rng() * 0.4,
    distanceScore: 0,
    score: 0,
    round: 1,
    maxRounds: 6,
  };
}

export function reducer(state: PaperAirplaneState, action: PaperAirplaneAction): PaperAirplaneState {
  if (state.phase === "gameover") return state;

  switch (action.type) {
    case "tick": {
      if (state.phase === "aiming") {
        let angle = state.angle + state.angleDir * ANGLE_SPEED * action.dt;
        let dir = state.angleDir;
        if (angle >= 70) { angle = 70; dir = -1; }
        if (angle <= 5) { angle = 5; dir = 1; }
        return { ...state, angle, angleDir: dir };
      }
      if (state.phase === "flying") {
        const newVelY = state.velY + GRAVITY * action.dt;
        const newX = state.planeX + state.velX * action.dt;
        const newY = state.planeY + newVelY * action.dt;
        if (newY >= 0.85 || newX >= 1) {
          const dist = Math.max(0, newX - 0.05);
          const targetDiff = Math.abs(newX - state.targetX);
          const accuracy = Math.max(0, 1 - targetDiff * 5);
          const pts = Math.round(dist * 80 + accuracy * 40);
          const isLast = state.round >= state.maxRounds;
          return {
            ...state,
            phase: isLast ? "gameover" : "landed",
            planeX: Math.min(newX, 1),
            planeY: Math.min(newY, 0.85),
            distanceScore: pts,
            score: state.score + pts,
          };
        }
        return { ...state, planeX: newX, planeY: newY, velY: newVelY };
      }
      return state;
    }
    case "launch": {
      if (state.phase === "aiming") {
        const rad = (state.angle * Math.PI) / 180;
        const speed = 0.45;
        return {
          ...state,
          phase: "flying",
          velX: Math.cos(rad) * speed,
          velY: -Math.sin(rad) * speed,
        };
      }
      if (state.phase === "landed") {
        const nextRound = state.round + 1;
        const next = initialState(nextRound * 137);
        return { ...next, score: state.score, round: nextRound };
      }
      return state;
    }
    default:
      return state;
  }
}

export function isTerminal(state: PaperAirplaneState): { score: number } | null {
  if (state.phase !== "gameover") return null;
  return { score: state.score };
}
