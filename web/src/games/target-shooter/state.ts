export type Phase = "aiming" | "shot" | "gameover";

export interface Target {
  x: number;   // 0..1
  y: number;   // 0..1
  r: number;   // radius 0..1
  speed: number;
  dir: 1 | -1;
}

export interface TargetShooterState {
  phase: Phase;
  crosshairX: number; // 0..1
  crosshairY: number;
  driftX: number;
  driftY: number;
  target: Target;
  shotX: number;
  shotY: number;
  lastPoints: number;
  score: number;
  round: number;
  maxRounds: number;
  elapsed: number;
}

export type TargetShooterAction =
  | { type: "tick"; dt: number }
  | { type: "fire" }
  | { type: "next"; seed: number };

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function makeTarget(seed: number, round: number): Target {
  const rng = mulberry32(seed);
  return {
    x: 0.2 + rng() * 0.6,
    y: 0.2 + rng() * 0.5,
    r: Math.max(0.06, 0.15 - round * 0.008),
    speed: 0.05 + round * 0.015,
    dir: rng() > 0.5 ? 1 : -1,
  };
}

export function initialState(seed = 1): TargetShooterState {
  return {
    phase: "aiming",
    crosshairX: 0.5,
    crosshairY: 0.5,
    driftX: 0.08,
    driftY: 0.06,
    target: makeTarget(seed, 1),
    shotX: 0.5,
    shotY: 0.5,
    lastPoints: 0,
    score: 0,
    round: 1,
    maxRounds: 10,
    elapsed: 0,
  };
}

export function reducer(state: TargetShooterState, action: TargetShooterAction): TargetShooterState {
  if (state.phase === "gameover") return state;

  switch (action.type) {
    case "tick": {
      if (state.phase !== "aiming") return state;
      // Crosshair drifts in a Lissajous pattern
      const t = state.elapsed + action.dt;
      const cx = 0.5 + Math.sin(t * state.driftX * 2 * Math.PI) * 0.3;
      const cy = 0.5 + Math.sin(t * state.driftY * 2 * Math.PI + 0.7) * 0.25;
      // Target moves horizontally
      let tx = state.target.x + state.target.dir * state.target.speed * action.dt;
      let td = state.target.dir;
      if (tx > 0.85) { tx = 0.85; td = -1; }
      if (tx < 0.15) { tx = 0.15; td = 1; }
      return {
        ...state,
        crosshairX: cx,
        crosshairY: cy,
        elapsed: t,
        target: { ...state.target, x: tx, dir: td },
      };
    }

    case "fire": {
      if (state.phase !== "aiming") return state;
      const dx = state.crosshairX - state.target.x;
      const dy = state.crosshairY - state.target.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const hit = dist <= state.target.r;
      const pts = hit ? Math.round(Math.max(10, (1 - dist / state.target.r) * 100)) : 0;
      const isLast = state.round >= state.maxRounds;
      return {
        ...state,
        phase: isLast && !hit ? "gameover" : isLast ? "gameover" : "shot",
        shotX: state.crosshairX,
        shotY: state.crosshairY,
        lastPoints: pts,
        score: state.score + pts,
      };
    }

    case "next": {
      if (state.phase !== "shot") return state;
      const nextR = state.round + 1;
      return {
        ...initialState(action.seed),
        score: state.score,
        round: nextR,
        maxRounds: state.maxRounds,
        target: makeTarget(action.seed, nextR),
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: TargetShooterState): { score: number } | null {
  if (state.phase !== "gameover") return null;
  return { score: state.score };
}
