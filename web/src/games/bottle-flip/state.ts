export type Phase = "aiming" | "flipping" | "landing" | "gameover";

export interface BottleFlipState {
  phase: Phase;
  power: number;       // 0..1, oscillates during aiming
  powerDir: 1 | -1;
  rotation: number;    // degrees, during flip
  rotSpeed: number;    // deg/sec
  altitude: number;    // 0..1 arc height during flip
  flipT: number;       // 0..1 time through flip arc
  landed: boolean;
  landAngle: number;   // rotation mod 360 at landing
  consecutiveLands: number;
  score: number;
  round: number;
  maxRounds: number;
}

export type BottleFlipAction =
  | { type: "tick"; dt: number }
  | { type: "flip" };

const POWER_SPEED = 1.2; // oscillations per second

export function initialState(): BottleFlipState {
  return {
    phase: "aiming",
    power: 0,
    powerDir: 1,
    rotation: 0,
    rotSpeed: 0,
    altitude: 0,
    flipT: 0,
    landed: false,
    landAngle: 0,
    consecutiveLands: 0,
    score: 0,
    round: 1,
    maxRounds: 8,
  };
}

function isUprightAngle(angle: number): boolean {
  const norm = ((angle % 360) + 360) % 360;
  return norm <= 30 || norm >= 330;
}

export function reducer(state: BottleFlipState, action: BottleFlipAction): BottleFlipState {
  if (state.phase === "gameover") return state;

  switch (action.type) {
    case "tick": {
      if (state.phase === "aiming") {
        let p = state.power + state.powerDir * POWER_SPEED * action.dt;
        let dir = state.powerDir;
        if (p >= 1) { p = 1; dir = -1; }
        if (p <= 0) { p = 0; dir = 1; }
        return { ...state, power: p, powerDir: dir };
      }
      if (state.phase === "flipping") {
        const newT = state.flipT + action.dt * 1.2;
        const newRot = state.rotation + state.rotSpeed * action.dt;
        const newAlt = newT <= 1 ? Math.sin(newT * Math.PI) : 0;
        if (newT >= 1) {
          // Landing
          const landAngle = ((newRot % 360) + 360) % 360;
          const success = isUprightAngle(landAngle);
          const bonus = success ? 10 + state.consecutiveLands * 5 : 0;
          const newConsec = success ? state.consecutiveLands + 1 : 0;
          const isLast = state.round >= state.maxRounds;
          return {
            ...state,
            phase: isLast ? "gameover" : "landing",
            flipT: 1,
            altitude: 0,
            rotation: newRot,
            landAngle,
            landed: success,
            consecutiveLands: newConsec,
            score: state.score + bonus,
          };
        }
        return { ...state, flipT: newT, rotation: newRot, altitude: newAlt };
      }
      return state;
    }
    case "flip": {
      if (state.phase === "aiming") {
        // power determines rotation speed: 0.3..1 maps to ~200..600 deg/sec
        const rotSpeed = 200 + state.power * 400;
        return {
          ...state,
          phase: "flipping",
          rotSpeed,
          flipT: 0,
          altitude: 0,
          rotation: 0,
        };
      }
      if (state.phase === "landing") {
        const nextRound = state.round + 1;
        return {
          ...initialState(),
          score: state.score,
          round: nextRound,
          maxRounds: state.maxRounds,
          consecutiveLands: state.consecutiveLands,
        };
      }
      return state;
    }
    default:
      return state;
  }
}

export function isTerminal(state: BottleFlipState): { score: number } | null {
  if (state.phase !== "gameover") return null;
  return { score: state.score };
}
