import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Mouse Trap (Full Build)
// ------------------------------------------------------------------
// 24-square loop board. 4 players (You + 3 CPUs). Each turn the
// active player rolls 1d6 and moves forward. If they land on a
// "Build a Part" square, the corresponding part is added to the
// communal Rube Goldberg trap. Once all 8 main parts (squares 1-8)
// have been built (cumulative across all players), the trap is
// armed. After arming, when a player lands on the Cheese Wheel
// square (19) the crank fires — every mouse currently parked on
// the "trigger-cage track" squares (16, 17, 18, 20, 21) is caught
// and eliminated. Last uncaught mouse wins.
//
// L→M scope: we implement the build phase, the trigger-cage
// activation and the win condition. The dice-mechanic mini-game
// between "land-on-build" vs "land-on-skip" is replaced with a
// deterministic square→effect mapping (BOARD constant below).
// ------------------------------------------------------------------

export const BOARD_LEN = 24;
export const CHEESE_WHEEL_SQUARE = 19;
export const NUM_PLAYERS = 4;

/** Squares on which a parked mouse is captured when the trap fires. */
export const CAGE_TRACK: readonly number[] = [16, 17, 18, 20, 21];

export type SquareKind =
  | "build" // 1-8: adds main trap part; first to land on each unique square contributes
  | "extra" // 10-12, 14, 17-22, 23: extra/scenery part squares (decorative — no gameplay effect beyond board art)
  | "spare" // square 9: spare turn (cosmetic skip)
  | "cheese" // square 19: where the crank fires once armed
  | "neutral"; // 0, 13, 15, 16: nothing happens

export interface Square {
  kind: SquareKind;
  label: string;
  /** Part index (0-7) for "build" squares — maps to PART_NAMES. */
  buildIndex?: number;
}

/** The 8 main trap parts. Building all 8 arms the trap. */
export const PART_NAMES: readonly string[] = [
  "Crank",
  "Stop Sign",
  "Shoe",
  "Bucket",
  "Rod",
  "Ball",
  "Bathtub",
  "Diver",
];

/** The 24-square loop. Index 0 is "Start" (square 0). */
export const BOARD: readonly Square[] = (() => {
  const out: Square[] = new Array(BOARD_LEN);
  // Default to neutral
  for (let i = 0; i < BOARD_LEN; i++) {
    out[i] = { kind: "neutral", label: `Sq ${i}` };
  }
  // Squares 1-8 are the eight main parts
  for (let i = 1; i <= 8; i++) {
    out[i] = { kind: "build", label: PART_NAMES[i - 1]!, buildIndex: i - 1 };
  }
  // Square 9: spare turn / lose a turn (no mechanical effect in this scope)
  out[9] = { kind: "spare", label: "Spare Turn" };
  // Extra scenery part squares — they are part of the classic art
  // but don't independently arm the trap. We mark them as "extra".
  const extras = [10, 11, 12, 14, 17, 18, 20, 21, 22, 23];
  const extraLabels: Record<number, string> = {
    10: "Helping Hand",
    11: "Wheel",
    12: "Tub Stopper",
    14: "Trigger Catch",
    17: "Cage Track A",
    18: "Cage Track B",
    20: "Cage Track C",
    21: "Cage Track D",
    22: "Crank Handle",
    23: "Finish Loop",
  };
  for (const idx of extras) {
    out[idx] = { kind: "extra", label: extraLabels[idx] ?? `Extra ${idx}` };
  }
  // Cheese wheel — the trap firing square
  out[CHEESE_WHEEL_SQUARE] = { kind: "cheese", label: "Cheese Wheel" };
  return out;
})();

export interface MouseTrapFullSettings {
  // No real settings yet — placeholder for future tuning.
  _dummy: boolean;
}

export interface LogEntry {
  turn: number;
  player: number;
  roll: number;
  from: number;
  to: number;
  message: string;
}

export type Phase =
  | "rolling" // active player can press Roll
  | "resolved" // last roll resolved, "Next" advances turn
  | "done"; // game ended

export interface MouseTrapFullState {
  rngSeed: number;
  /** Whose turn it is. 0 is You; 1-3 are CPUs. */
  current: number;
  /** Each player's pawn position on the 24-square loop. */
  positions: number[];
  /** Per-player capture state. true → that mouse has been trapped. */
  caught: boolean[];
  /** Set of trap part indices (0-7) that have been built. */
  partsBuilt: boolean[];
  /** True once all 8 main parts have been built. */
  armed: boolean;
  /** Player index of the winner, or null while the game is ongoing. */
  winner: number | null;
  /** True when the trap has fired at least once (cinematic flag). */
  trapFired: boolean;
  phase: Phase;
  lastRoll: number | null;
  /** Number of opponents the human (player 0) has caused to be caught. */
  caughtByHuman: number;
  log: LogEntry[];
  /** Total turns played (for safety bounds). */
  turn: number;
}

export type MouseTrapFullAction =
  | { type: "roll" }
  | { type: "next" }
  | { type: "cpu-step" }; // executes one CPU action (roll + next) for the current CPU

// ---------- helpers ----------

function rollDie(seed: number): { d: number; nextSeed: number } {
  const r = mulberry32(seed);
  const d = 1 + Math.floor(r() * 6);
  const nextSeed = Math.floor(r() * 2 ** 31);
  return { d, nextSeed };
}

function nextActivePlayer(positions: number[], caught: boolean[], from: number): number {
  // Find the next not-caught player after `from`, wrapping around.
  for (let i = 1; i <= positions.length; i++) {
    const cand = (from + i) % positions.length;
    if (!caught[cand]) return cand;
  }
  return from; // shouldn't happen — at least one alive
}

function aliveCount(caught: boolean[]): number {
  let n = 0;
  for (const c of caught) if (!c) n++;
  return n;
}

function fireTrap(state: MouseTrapFullState, firingPlayer: number): MouseTrapFullState {
  // Every player on the cage track squares (except the firing player
  // who is on the cheese wheel) is caught.
  const cageSet = new Set(CAGE_TRACK);
  const newCaught = [...state.caught];
  const newlyCaughtPlayers: number[] = [];
  for (let p = 0; p < state.positions.length; p++) {
    if (newCaught[p]) continue;
    if (p === firingPlayer) continue;
    if (cageSet.has(state.positions[p]!)) {
      newCaught[p] = true;
      newlyCaughtPlayers.push(p);
    }
  }
  let caughtByHuman = state.caughtByHuman;
  if (firingPlayer === 0) caughtByHuman += newlyCaughtPlayers.length;
  const alive = aliveCount(newCaught);
  let winner: number | null = state.winner;
  let phase: Phase = state.phase;
  if (alive <= 1) {
    // Find the lone survivor (or default to firing player if everyone was caught)
    winner = newCaught.findIndex((c) => !c);
    if (winner < 0) winner = firingPlayer;
    phase = "done";
  }
  const message =
    newlyCaughtPlayers.length === 0
      ? `Player ${firingPlayer} cranks the trap — but nobody is on the cage track. Whew!`
      : `Player ${firingPlayer} cranks the trap and catches ${newlyCaughtPlayers
          .map((i) => `P${i}`)
          .join(", ")}!`;
  const log: LogEntry = {
    turn: state.turn,
    player: firingPlayer,
    roll: state.lastRoll ?? 0,
    from: state.positions[firingPlayer]!,
    to: state.positions[firingPlayer]!,
    message,
  };
  return {
    ...state,
    caught: newCaught,
    trapFired: true,
    winner,
    phase,
    caughtByHuman,
    log: [log, ...state.log].slice(0, 16),
  };
}

// ---------- initial state ----------

export function initialState(seed: number, _settings: MouseTrapFullSettings): MouseTrapFullState {
  return {
    rngSeed: seed >>> 0,
    current: 0,
    positions: new Array(NUM_PLAYERS).fill(0),
    caught: new Array(NUM_PLAYERS).fill(false),
    partsBuilt: new Array(PART_NAMES.length).fill(false),
    armed: false,
    winner: null,
    trapFired: false,
    phase: "rolling",
    lastRoll: null,
    caughtByHuman: 0,
    log: [],
    turn: 1,
  };
}

// ---------- reducer ----------

export function reducer(state: MouseTrapFullState, action: MouseTrapFullAction): MouseTrapFullState {
  if (state.phase === "done") return state;

  if (action.type === "roll" && state.phase === "rolling") {
    const player = state.current;
    if (state.caught[player]) {
      // Skip to next active player without consuming dice.
      const np = nextActivePlayer(state.positions, state.caught, player);
      return { ...state, current: np };
    }
    const { d, nextSeed } = rollDie(state.rngSeed);
    const from = state.positions[player]!;
    const to = (from + d) % BOARD_LEN;
    const newPositions = [...state.positions];
    newPositions[player] = to;
    const square = BOARD[to]!;

    let partsBuilt = state.partsBuilt;
    let armed = state.armed;
    let message = `P${player} rolled ${d}, ${from} → ${to} (${square.label}).`;

    // Build action
    if (square.kind === "build" && typeof square.buildIndex === "number") {
      if (!partsBuilt[square.buildIndex]) {
        partsBuilt = [...partsBuilt];
        partsBuilt[square.buildIndex] = true;
        message += ` Built the ${PART_NAMES[square.buildIndex]}!`;
      } else {
        message += ` (${PART_NAMES[square.buildIndex]} already built.)`;
      }
      if (!armed && partsBuilt.every(Boolean)) {
        armed = true;
        message += " The trap is now ARMED!";
      }
    } else if (square.kind === "cheese") {
      if (armed) {
        message += " Trap fires!";
      } else {
        message += ` (Need ${partsBuilt.filter((x) => !x).length} more parts to arm.)`;
      }
    } else if (square.kind === "spare") {
      message += " Spare turn — no extra effect.";
    }

    const log: LogEntry = { turn: state.turn, player, roll: d, from, to, message };
    let next: MouseTrapFullState = {
      ...state,
      rngSeed: nextSeed,
      positions: newPositions,
      partsBuilt,
      armed,
      phase: "resolved",
      lastRoll: d,
      log: [log, ...state.log].slice(0, 16),
    };

    // If armed and landed on cheese, fire the trap.
    if (armed && square.kind === "cheese") {
      next = fireTrap(next, player);
    }
    return next;
  }

  if (action.type === "next" && state.phase === "resolved") {
    const np = nextActivePlayer(state.positions, state.caught, state.current);
    return {
      ...state,
      current: np,
      phase: "rolling",
      lastRoll: null,
      turn: state.turn + 1,
    };
  }

  if (action.type === "cpu-step") {
    // Convenience: if it's a CPU's turn and we're rolling, take a turn.
    if (state.phase !== "rolling") return state;
    if (state.current === 0) return state;
    const after = reducer(state, { type: "roll" });
    if (after.phase === "resolved") return reducer(after, { type: "next" });
    return after;
  }

  return state;
}

// ---------- terminal & scoring ----------

/**
 * Score formula: +50 per opponent the human caught + 100 win bonus.
 * If the human lost, score is 50 × opponents-they-caught (still
 * gives a participation reward) but loses if zero.
 */
export function score(s: MouseTrapFullState): number {
  if (s.winner === null) return 0;
  const caughtBonus = s.caughtByHuman * 50;
  const winBonus = s.winner === 0 ? 100 : 0;
  return Math.max(0, caughtBonus + winBonus);
}

export function isTerminal(s: MouseTrapFullState): { score: number } | null {
  if (s.phase !== "done") return null;
  return { score: score(s) };
}
