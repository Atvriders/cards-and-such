import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Duck {
  id: number;
  x: number;    // 0-1
  y: number;    // 0-1
  vx: number;   // 0-1/s (can be negative)
  vy: number;
  hit: boolean;
  hitTimer: number; // countdown after being hit before disappearing
}

export interface DuckShootState {
  settings: { rounds: "3" | "5" | "10"; ammo: "5" | "10" | "15" };
  ducks: readonly Duck[];
  round: number;
  totalRounds: number;
  ammoLeft: number;
  ammoPerRound: number;
  score: number;
  roundOver: boolean;
  ended: boolean;
  elapsed: number;
  rngSeed: number;
  rngCounter: number;
  nextId: number;
}

export type DuckShootAction =
  | { type: "tick"; dt: number }
  | { type: "shoot"; x: number; y: number } // normalized 0-1
  | { type: "nextRound" };

const HIT_RADIUS = 0.07;
const DUCKS_PER_ROUND = 6;
const DUCK_SPEED_MIN = 0.08;
const DUCK_SPEED_MAX = 0.25;
const ROUND_WAIT = 2.0; // seconds before auto-advancing after all ducks gone

function rngAt(seed: number, counter: number): number {
  const rng = mulberry32(seed + counter * 1000003);
  return rng();
}

function spawnDucks(
  seed: number,
  counter: number,
  count: number,
): { ducks: Duck[]; counter: number; nextId: number } {
  let c = counter;
  let id = 0;
  const ducks: Duck[] = [];
  for (let i = 0; i < count; i++) {
    const x = 0.05 + rngAt(seed, c++) * 0.9;
    const y = 0.1 + rngAt(seed, c++) * 0.65;
    const speed = DUCK_SPEED_MIN + rngAt(seed, c++) * (DUCK_SPEED_MAX - DUCK_SPEED_MIN);
    const angle = rngAt(seed, c++) * Math.PI * 2;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * (speed * 0.4);
    ducks.push({ id: id++, x, y, vx, vy, hit: false, hitTimer: 0 });
  }
  return { ducks, counter: c, nextId: id };
}

export function initialState(
  seed: number,
  settings: { rounds: "3" | "5" | "10"; ammo: "5" | "10" | "15" },
): DuckShootState {
  const totalRounds = parseInt(settings.rounds, 10);
  const ammoPerRound = parseInt(settings.ammo, 10);
  const { ducks, counter, nextId } = spawnDucks(seed, 0, DUCKS_PER_ROUND);
  return {
    settings,
    ducks,
    round: 1,
    totalRounds,
    ammoLeft: ammoPerRound,
    ammoPerRound,
    score: 0,
    roundOver: false,
    ended: false,
    elapsed: 0,
    rngSeed: seed,
    rngCounter: counter,
    nextId,
  };
}

export function reducer(state: DuckShootState, action: DuckShootAction): DuckShootState {
  if (state.ended) return state;

  switch (action.type) {
    case "tick": {
      const dt = action.dt;
      let elapsed = state.elapsed + dt;

      // Move ducks, handle hit timers
      let ducks = state.ducks.map((d) => {
        if (d.hit) {
          return { ...d, hitTimer: d.hitTimer - dt };
        }
        let nx = d.x + d.vx * dt;
        let ny = d.y + d.vy * dt;
        let nvx = d.vx;
        let nvy = d.vy;
        if (nx < 0.02 || nx > 0.98) { nvx = -nvx; nx = Math.max(0.02, Math.min(0.98, nx)); }
        if (ny < 0.05 || ny > 0.78) { nvy = -nvy; ny = Math.max(0.05, Math.min(0.78, ny)); }
        return { ...d, x: nx, y: ny, vx: nvx, vy: nvy };
      }).filter((d) => !d.hit || d.hitTimer > 0);

      const allGone = ducks.every((d) => d.hit);
      const noAmmo = state.ammoLeft <= 0;
      const roundShouldEnd = (allGone || noAmmo) && !state.roundOver;

      let roundOver = state.roundOver;
      let roundEndTimer = elapsed;

      if (roundShouldEnd) {
        roundOver = true;
        roundEndTimer = 0;
        elapsed = 0;
      }

      // Auto-advance after wait
      if (roundOver && elapsed >= ROUND_WAIT) {
        const nextRound = state.round + 1;
        const ended = nextRound > state.totalRounds;
        if (ended) {
          return { ...state, ducks: [], ended: true, roundOver: true };
        }
        // Spawn next round
        const { ducks: newDucks, counter, nextId } = spawnDucks(
          state.rngSeed,
          state.rngCounter,
          DUCKS_PER_ROUND,
        );
        return {
          ...state,
          ducks: newDucks,
          round: nextRound,
          ammoLeft: state.ammoPerRound,
          roundOver: false,
          elapsed: 0,
          rngCounter: counter,
          nextId,
        };
      }

      return { ...state, ducks, elapsed: roundOver ? roundEndTimer + dt : elapsed, roundOver };
    }

    case "shoot": {
      if (state.roundOver || state.ammoLeft <= 0) return state;
      // Find nearest unhit duck in HIT_RADIUS
      let hit = false;
      const ducks = state.ducks.map((d) => {
        if (d.hit || hit) return d;
        const dx = d.x - action.x;
        const dy = d.y - action.y;
        if (Math.sqrt(dx * dx + dy * dy) < HIT_RADIUS) {
          hit = true;
          return { ...d, hit: true, hitTimer: 0.5 };
        }
        return d;
      });
      return {
        ...state,
        ducks,
        score: hit ? state.score + 1 : state.score,
        ammoLeft: state.ammoLeft - 1,
      };
    }

    case "nextRound": {
      if (!state.roundOver) return state;
      const nextRound = state.round + 1;
      const ended = nextRound > state.totalRounds;
      if (ended) return { ...state, ended: true };
      const { ducks, counter, nextId } = spawnDucks(
        state.rngSeed,
        state.rngCounter,
        DUCKS_PER_ROUND,
      );
      return {
        ...state,
        ducks,
        round: nextRound,
        ammoLeft: state.ammoPerRound,
        roundOver: false,
        elapsed: 0,
        rngCounter: counter,
        nextId,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: DuckShootState): { score: number } | null {
  if (!state.ended) return null;
  return { score: state.score };
}
