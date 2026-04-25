export type Phase = "pulling" | "flying" | "scored" | "gameover";

export interface SlingshotTarget {
  x: number;  // 0..1
  y: number;  // 0..1
  r: number;  // radius 0..1
  points: number;
}

export interface SlingshotLaunchState {
  phase: Phase;
  pullAngle: number;    // degrees, sweeps back and forth
  pullDir: 1 | -1;
  pullPower: number;    // 0..1
  powerDir: 1 | -1;
  projectileX: number;
  projectileY: number;
  velX: number;
  velY: number;
  targets: SlingshotTarget[];
  hitTargetIdx: number;
  lastPts: number;
  score: number;
  shotsLeft: number;
  round: number;
  maxRounds: number;
}

export type SlingshotLaunchAction =
  | { type: "tick"; dt: number }
  | { type: "release" }
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

function makeTargets(seed: number): SlingshotTarget[] {
  const rng = mulberry32(seed);
  return [
    { x: 0.5 + rng() * 0.35, y: 0.2 + rng() * 0.2, r: 0.07, points: 100 },
    { x: 0.5 + rng() * 0.35, y: 0.4 + rng() * 0.15, r: 0.10, points: 50 },
    { x: 0.5 + rng() * 0.35, y: 0.55 + rng() * 0.15, r: 0.13, points: 25 },
  ];
}

export function initialState(seed = 1): SlingshotLaunchState {
  return {
    phase: "pulling",
    pullAngle: 45,
    pullDir: 1,
    pullPower: 0.5,
    powerDir: 1,
    projectileX: 0.1,
    projectileY: 0.8,
    velX: 0,
    velY: 0,
    targets: makeTargets(seed),
    hitTargetIdx: -1,
    lastPts: 0,
    score: 0,
    shotsLeft: 3,
    round: 1,
    maxRounds: 5,
  };
}

const ANGLE_SPEED = 60; // deg/sec
const POWER_SPEED = 0.6;
const GRAVITY = 0.3;

export function reducer(state: SlingshotLaunchState, action: SlingshotLaunchAction): SlingshotLaunchState {
  if (state.phase === "gameover") return state;

  switch (action.type) {
    case "tick": {
      if (state.phase === "pulling") {
        let angle = state.pullAngle + state.pullDir * ANGLE_SPEED * action.dt;
        let adir = state.pullDir;
        if (angle >= 80) { angle = 80; adir = -1; }
        if (angle <= 10) { angle = 10; adir = 1; }
        let power = state.pullPower + state.powerDir * POWER_SPEED * action.dt;
        let pdir = state.powerDir;
        if (power >= 1) { power = 1; pdir = -1; }
        if (power <= 0.1) { power = 0.1; pdir = 1; }
        return { ...state, pullAngle: angle, pullDir: adir, pullPower: power, powerDir: pdir };
      }
      if (state.phase === "flying") {
        const newVelY = state.velY + GRAVITY * action.dt;
        const newX = state.projectileX + state.velX * action.dt;
        const newY = state.projectileY + newVelY * action.dt;

        // Check target hits
        for (let i = 0; i < state.targets.length; i++) {
          const t = state.targets[i]!;
          const dx = newX - t.x;
          const dy = newY - t.y;
          if (Math.sqrt(dx * dx + dy * dy) < t.r) {
            const isLast = state.round >= state.maxRounds && state.shotsLeft <= 1;
            return {
              ...state,
              phase: isLast ? "gameover" : "scored",
              projectileX: newX,
              projectileY: newY,
              hitTargetIdx: i,
              lastPts: t.points,
              score: state.score + t.points,
              shotsLeft: state.shotsLeft - 1,
            };
          }
        }

        if (newX > 1.1 || newY > 1.1) {
          const isLast = state.round >= state.maxRounds && state.shotsLeft <= 1;
          return {
            ...state,
            phase: isLast ? "gameover" : "scored",
            projectileX: Math.min(newX, 1.1),
            projectileY: Math.min(newY, 1.1),
            hitTargetIdx: -1,
            lastPts: 0,
            shotsLeft: state.shotsLeft - 1,
          };
        }

        return { ...state, projectileX: newX, projectileY: newY, velY: newVelY };
      }
      return state;
    }

    case "release": {
      if (state.phase !== "pulling") return state;
      const rad = (state.pullAngle * Math.PI) / 180;
      const speed = 0.6 + state.pullPower * 0.8;
      return {
        ...state,
        phase: "flying",
        velX: Math.cos(rad) * speed,
        velY: -Math.sin(rad) * speed,
      };
    }

    case "next": {
      if (state.phase !== "scored") return state;
      if (state.shotsLeft > 0) {
        // More shots remaining in this round
        return {
          ...state,
          phase: "pulling",
          projectileX: 0.1,
          projectileY: 0.8,
          velX: 0,
          velY: 0,
          hitTargetIdx: -1,
          lastPts: 0,
          pullAngle: 45,
          pullDir: 1,
          pullPower: 0.5,
          powerDir: 1,
        };
      }
      // Next round
      const nextRound = state.round + 1;
      return {
        ...initialState(nextRound * 137),
        score: state.score,
        round: nextRound,
        maxRounds: state.maxRounds,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SlingshotLaunchState): { score: number } | null {
  if (state.phase !== "gameover") return null;
  return { score: state.score };
}
