import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TruelSettings {
  rounds: "1" | "3";
}

export type ShooterId = "A" | "B" | "C";
export type TargetChoice = ShooterId | "air";

export interface TruelState {
  settings: TruelSettings;
  rngSeed: number;
  alive: Record<ShooterId, boolean>;
  turn: ShooterId;
  /** null = game not started for this action / waiting for player (A) */
  lastAction: string | null;
  gameOver: boolean;
  winner: ShooterId | "none" | null;
  // hit probabilities: A=1/3, B=1/2, C=1/1
  log: string[];
  matchWins: { player: number; bot: number; draws: number };
  matchRound: number;
  maxRounds: number;
}

export type TruelAction =
  | { type: "shoot"; target: TargetChoice }
  | { type: "restart" };

/** Accuracy for each shooter */
const ACCURACY: Record<ShooterId, number> = { A: 1 / 3, B: 0.5, C: 1.0 };

function nextShooter(alive: Record<ShooterId, boolean>, current: ShooterId): ShooterId | null {
  const order: ShooterId[] = ["A", "B", "C"];
  const idx = order.indexOf(current);
  for (let i = 1; i <= 3; i++) {
    const next = order[(idx + i) % 3]!;
    if (alive[next]) return next;
  }
  return null;
}

function livingCount(alive: Record<ShooterId, boolean>): number {
  return (Object.keys(alive) as ShooterId[]).filter((k) => alive[k]).length;
}

function strongestTarget(alive: Record<ShooterId, boolean>, self: ShooterId): ShooterId | null {
  // Priority: C > B > A, skip self
  const order: ShooterId[] = ["C", "B", "A"];
  for (const s of order) {
    if (s !== self && alive[s]) return s;
  }
  return null;
}

function rngHit(accuracy: number, rng: () => number): boolean {
  return rng() < accuracy;
}

function checkGameOver(alive: Record<ShooterId, boolean>): ShooterId | "none" | null {
  const living = (Object.keys(alive) as ShooterId[]).filter((k) => alive[k]);
  if (living.length === 0) return "none";
  if (living.length === 1) return living[0]!;
  return null;
}

export function initialState(seed: number, settings: TruelSettings): TruelState {
  return {
    settings,
    rngSeed: seed,
    alive: { A: true, B: true, C: true },
    turn: "A",
    lastAction: null,
    gameOver: false,
    winner: null,
    log: ["Truel begins! A shoots first (you are A)."],
    matchWins: { player: 0, bot: 0, draws: 0 },
    matchRound: 1,
    maxRounds: parseInt(settings.rounds, 10),
  };
}

export function reducer(state: TruelState, action: TruelAction): TruelState {
  if (action.type === "restart") {
    return {
      ...initialState(state.rngSeed + 1, state.settings),
      matchWins: state.matchWins,
      matchRound: state.matchRound + 1,
    };
  }

  if (action.type === "shoot") {
    if (state.gameOver || state.turn !== "A") return state;
    const { target } = action;

    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    let alive = { ...state.alive };
    const log = [...state.log];

    // A shoots
    if (target === "air") {
      log.push("A shoots into the air (intentional miss).");
    } else if (!alive[target]) {
      log.push(`A targets ${target} but they are already dead.`);
    } else {
      const hit = rngHit(ACCURACY.A, rng);
      if (hit) {
        alive[target] = false;
        log.push(`A shoots at ${target} — HIT! ${target} is eliminated.`);
      } else {
        log.push(`A shoots at ${target} — MISS.`);
      }
    }

    // Check game over after A
    let winner = checkGameOver(alive);
    if (winner !== null) {
      const playerWon = winner === "A";
      return finalize(state, alive, winner, playerWon, log, nextSeed);
    }

    // B shoots
    const bTarget = strongestTarget(alive, "B");
    if (bTarget) {
      const hit = rngHit(ACCURACY.B, rng);
      if (hit) {
        alive[bTarget] = false;
        log.push(`B shoots at ${bTarget} — HIT! ${bTarget} is eliminated.`);
      } else {
        log.push(`B shoots at ${bTarget} — MISS.`);
      }
    }

    winner = checkGameOver(alive);
    if (winner !== null) {
      const playerWon = winner === "A";
      return finalize(state, alive, winner, playerWon, log, nextSeed);
    }

    // C shoots
    const cTarget = strongestTarget(alive, "C");
    if (cTarget) {
      // C always hits
      alive[cTarget] = false;
      log.push(`C shoots at ${cTarget} — HIT! ${cTarget} is eliminated.`);
    }

    winner = checkGameOver(alive);
    if (winner !== null) {
      const playerWon = winner === "A";
      return finalize(state, alive, winner, playerWon, log, nextSeed);
    }

    // Next round — A goes first again if still alive
    const nextTurn: ShooterId = alive.A ? "A" : (alive.B ? "B" : "C");
    log.push(`--- Round continues. Your turn (A). ---`);

    return {
      ...state,
      rngSeed: nextSeed,
      alive,
      turn: nextTurn,
      lastAction: null,
      log,
    };
  }

  return state;
}

function finalize(
  state: TruelState,
  alive: Record<ShooterId, boolean>,
  winner: ShooterId | "none",
  playerWon: boolean,
  log: string[],
  nextSeed: number,
): TruelState {
  const winMsg = winner === "none" ? "All shooters eliminated!" : `${winner} is the last one standing!`;
  log.push(winMsg);

  const matchWins = {
    player: state.matchWins.player + (playerWon ? 1 : 0),
    bot: state.matchWins.bot + (!playerWon && winner !== "none" ? 1 : 0),
    draws: state.matchWins.draws + (winner === "none" ? 1 : 0),
  };

  return {
    ...state,
    rngSeed: nextSeed,
    alive,
    gameOver: true,
    winner,
    log,
    matchWins,
  };
}

export function isTerminal(state: TruelState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.winner === "A" ? 100 : 0 };
}
