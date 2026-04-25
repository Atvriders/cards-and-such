export type Phase = "charging" | "flying" | "returning" | "caught" | "gameover";

export interface BoomerangThrowState {
  phase: Phase;
  charge: number;      // 0..1
  chargeDir: 1 | -1;
  boomX: number;      // 0..1
  boomY: number;
  angle: number;      // rotation degrees
  t: number;          // 0..1 flight progress
  catches: number;
  lastPts: number;
  catchWindow: number; // 0..1, how good was the catch timing
  catchIndicator: number; // 0..1 oscillating catch indicator
  catchDir: 1 | -1;
  score: number;
  round: number;
  maxRounds: number;
}

export type BoomerangThrowAction =
  | { type: "tick"; dt: number }
  | { type: "act" };   // throw or catch

export function initialState(): BoomerangThrowState {
  return {
    phase: "charging",
    charge: 0,
    chargeDir: 1,
    boomX: 0.5,
    boomY: 0.8,
    angle: 0,
    t: 0,
    catches: 0,
    lastPts: 0,
    catchWindow: 0,
    catchIndicator: 0.5,
    catchDir: 1,
    score: 0,
    round: 1,
    maxRounds: 8,
  };
}

const CATCH_SPEED = 1.5;

export function reducer(state: BoomerangThrowState, action: BoomerangThrowAction): BoomerangThrowState {
  if (state.phase === "gameover") return state;

  switch (action.type) {
    case "tick": {
      if (state.phase === "charging") {
        let c = state.charge + state.chargeDir * 0.9 * action.dt;
        let dir = state.chargeDir;
        if (c >= 1) { c = 1; dir = -1; }
        if (c <= 0) { c = 0; dir = 1; }
        return { ...state, charge: c, chargeDir: dir };
      }
      if (state.phase === "flying" || state.phase === "returning") {
        const speed = 1.2 + state.charge * 0.8;
        const newT = state.t + speed * action.dt * (state.phase === "flying" ? 1 : 1);
        const newAngle = state.angle + 360 * speed * action.dt;
        // Boomerang follows a curved path: out and back
        let bx: number, by: number;
        if (state.phase === "flying") {
          bx = 0.5 + Math.sin(newT * Math.PI) * 0.35;
          by = 0.8 - newT * 0.6;
        } else {
          const rt = newT - 1;
          bx = 0.5 + Math.sin((1 - rt) * Math.PI) * 0.35;
          by = 0.8 - (1 - rt) * 0.6;
        }
        if (state.phase === "flying" && newT >= 1) {
          return { ...state, phase: "returning", t: 1, boomX: bx, boomY: by, angle: newAngle };
        }
        if (state.phase === "returning" && newT >= 2) {
          // Auto miss if not caught
          const isLast = state.round >= state.maxRounds;
          return {
            ...state,
            phase: isLast ? "gameover" : "caught",
            t: 2, boomX: 0.5, boomY: 0.8, angle: newAngle,
            lastPts: 0, catchWindow: 0,
          };
        }
        // Update catch indicator
        let ci = state.catchIndicator + state.catchDir * CATCH_SPEED * action.dt;
        let cd = state.catchDir;
        if (ci >= 1) { ci = 1; cd = -1; }
        if (ci <= 0) { ci = 0; cd = 1; }
        return { ...state, t: newT, boomX: bx, boomY: by, angle: newAngle, catchIndicator: ci, catchDir: cd };
      }
      return state;
    }

    case "act": {
      if (state.phase === "charging") {
        return { ...state, phase: "flying", t: 0, boomX: 0.5, boomY: 0.8, catchIndicator: 0.5 };
      }
      if (state.phase === "returning") {
        // Catch: score based on catchIndicator closeness to 0.5 (center = perfect)
        const diff = Math.abs(state.catchIndicator - 0.5) * 2; // 0=perfect 1=worst
        const accuracy = Math.max(0, 1 - diff);
        const pts = Math.round(10 + accuracy * 90 + state.catches * 5);
        const isLast = state.round >= state.maxRounds;
        return {
          ...state,
          phase: isLast ? "gameover" : "caught",
          lastPts: pts,
          catchWindow: accuracy,
          score: state.score + pts,
          catches: state.catches + 1,
        };
      }
      if (state.phase === "caught") {
        const nextRound = state.round + 1;
        return { ...initialState(), score: state.score, round: nextRound, catches: state.catches };
      }
      return state;
    }
    default:
      return state;
  }
}

export function isTerminal(state: BoomerangThrowState): { score: number } | null {
  if (state.phase !== "gameover") return null;
  return { score: state.score };
}
