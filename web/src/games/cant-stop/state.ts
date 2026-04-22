import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Column heights: 2→3, 3→5, 4→7, 5→9, 6→11, 7→13, 8→11, 9→9, 10→7, 11→5, 12→3
export const COLUMN_HEIGHTS: Record<number, number> = {
  2: 3, 3: 5, 4: 7, 5: 9, 6: 11, 7: 13,
  8: 11, 9: 9, 10: 7, 11: 5, 12: 3,
};
export const COLUMNS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export type PlayerIdx = 0 | 1 | 2; // 0 = human, 1+ = bots

export interface CantStopSettings {
  opponents: "1" | "2";
}

export interface PlayerProgress {
  /** Permanently claimed columns (value = top, i.e. COLUMN_HEIGHTS[col]) */
  claimed: Partial<Record<number, number>>;
  /** Banked progress per column (steps taken) */
  banked: Partial<Record<number, number>>;
}

export type Phase =
  | "preRoll"       // player decides to roll
  | "pickSplit"     // player picks which pair split to use
  | "busted"        // player busted — no valid splits
  | "botTurn"       // bot is processing
  | "gameOver";

export interface CantStopState {
  settings: CantStopSettings;
  rngSeed: number;
  numPlayers: number;
  currentPlayer: PlayerIdx;
  players: PlayerProgress[];
  /** Active runner positions for this turn: up to 3 column→steps mappings */
  runners: Partial<Record<number, number>>;
  /** Last rolled 4 dice values */
  lastRoll: [number, number, number, number] | null;
  /** All valid splits from last roll: [[colA, colB], ...] */
  validSplits: [number, number][];
  phase: Phase;
  winner: PlayerIdx | null;
  message: string;
}

export type CantStopAction =
  | { type: "roll" }
  | { type: "pickSplit"; pairs: [number, number] }
  | { type: "bank" }
  | { type: "continue" };

function rollFour(seed: number): { dice: [number, number, number, number]; nextSeed: number } {
  const rng = mulberry32(seed);
  const dice: number[] = [];
  for (let i = 0; i < 4; i++) dice.push(Math.floor(rng() * 6) + 1);
  const nextSeed = Math.floor(rng() * 2 ** 31) >>> 0;
  return { dice: dice as [number, number, number, number], nextSeed };
}

/** Generate all 3 possible pair splits of 4 dice */
function allSplits(dice: [number, number, number, number]): [number, number][] {
  const [a, b, c, d] = dice;
  return [
    [a + b, c + d],
    [a + c, b + d],
    [a + d, b + c],
  ];
}

/** Given runners and player progress, which columns are available (claimed or open, not at top) */
function validSplitsFor(
  splits: [number, number][],
  runners: Partial<Record<number, number>>,
  player: PlayerProgress,
): [number, number][] {
  const runnerCols = Object.keys(runners).map(Number);
  const claimedByOther = new Set<number>(); // not used here — any claimed col is blocked
  // A column is "available" if player hasn't claimed it yet (not at top)
  function colAvailable(col: number): boolean {
    if (col < 2 || col > 12) return false;
    // If claimed by this player, not available
    if ((player.claimed[col] ?? 0) >= COLUMN_HEIGHTS[col]!) return false;
    return true;
  }
  function splitValid(split: [number, number]): boolean {
    const [c1, c2] = split;
    const runnerCount = runnerCols.length;
    const has1 = runnerCols.includes(c1) || (player.claimed[c1] ?? 0) > 0;
    const has2 = runnerCols.includes(c2) || (player.claimed[c2] ?? 0) > 0;
    const sameCol = c1 === c2;

    if (sameCol) {
      // Need col to be available
      if (!colAvailable(c1)) return false;
      if (!runnerCols.includes(c1) && runnerCount >= 3) return false;
      return true;
    }
    // Two different columns
    let newRunners = 0;
    if (!runnerCols.includes(c1)) {
      if (!colAvailable(c1)) return false;
      newRunners++;
    }
    if (!runnerCols.includes(c2)) {
      if (!colAvailable(c2)) return false;
      newRunners++;
    }
    if (runnerCount + newRunners > 3) return false;
    return true;
  }
  // Deduplicate splits (normalize order)
  const seen = new Set<string>();
  const result: [number, number][] = [];
  for (const s of splits) {
    const key = [Math.min(s[0], s[1]), Math.max(s[0], s[1])].join(",");
    if (!seen.has(key)) {
      seen.add(key);
      if (splitValid(s)) result.push(s);
    }
  }
  return result;
}

function applyRunners(
  runners: Partial<Record<number, number>>,
  split: [number, number],
  player: PlayerProgress,
): Partial<Record<number, number>> {
  const next = { ...runners };
  for (const col of split) {
    const base = next[col] ?? player.banked[col] ?? 0;
    const top = COLUMN_HEIGHTS[col]!;
    next[col] = Math.min(base + 1, top);
  }
  return next;
}

function checkWin(player: PlayerProgress): boolean {
  const claimed = Object.values(player.claimed).filter((v) => (v ?? 0) > 0).length;
  return claimed >= 3;
}

/** Bot: pick the split that advances the most runner progress */
function botPickSplit(validSplits: [number, number][]): [number, number] {
  // Prefer the split with columns that already have runners (advance existing rather than open new)
  return validSplits[0]!;
}

export function initialState(seed: number, settings: CantStopSettings): CantStopState {
  const numPlayers = parseInt(settings.opponents, 10) + 1;
  const players: PlayerProgress[] = Array.from({ length: numPlayers }, () => ({
    claimed: {},
    banked: {},
  }));
  return {
    settings,
    rngSeed: seed >>> 0,
    numPlayers,
    currentPlayer: 0,
    players,
    runners: {},
    lastRoll: null,
    validSplits: [],
    phase: "preRoll",
    winner: null,
    message: "Roll to begin your turn.",
  };
}

function nextPlayer(current: PlayerIdx, num: number): PlayerIdx {
  return ((current + 1) % num) as PlayerIdx;
}

function runBotTurn(state: CantStopState): CantStopState {
  let s = state;
  // Bot plays: roll, pick best split, decide to bank or continue (simple: bank if 2+ runners near top)
  for (let maxRolls = 0; maxRolls < 20; maxRolls++) {
    if (s.phase === "busted") break;
    // Roll
    const { dice, nextSeed } = rollFour(s.rngSeed);
    const splits = allSplits(dice);
    const player = s.players[s.currentPlayer]!;
    const valid = validSplitsFor(splits, s.runners, player);
    if (valid.length === 0) {
      // Busted
      const np = nextPlayer(s.currentPlayer, s.numPlayers);
      const resetPlayers = s.players.map((p, i) =>
        i === s.currentPlayer ? { ...p } : p,
      );
      s = {
        ...s,
        rngSeed: nextSeed,
        players: resetPlayers,
        runners: {},
        lastRoll: dice,
        validSplits: [],
        phase: s.currentPlayer === 0 ? "preRoll" : "preRoll",
        currentPlayer: np,
        message: `Bot busted! Turn lost.`,
      };
      break;
    }
    // Pick split
    const picked = botPickSplit(valid);
    const newRunners = applyRunners(s.runners, picked, player);
    s = { ...s, rngSeed: nextSeed, runners: newRunners, lastRoll: dice };

    // Check if should bank: bank if any runner is at the top of its column or 2+ near top
    const topCount = Object.entries(newRunners).filter(
      ([col, pos]) => pos !== undefined && pos >= COLUMN_HEIGHTS[Number(col)]!,
    ).length;

    if (topCount >= 1 || Object.keys(newRunners).length >= 3) {
      // Bank
      const updatedPlayer = bankRunners(player, newRunners);
      const newPlayers = s.players.map((p, i) =>
        i === s.currentPlayer ? updatedPlayer : p,
      );
      if (checkWin(updatedPlayer)) {
        s = {
          ...s,
          players: newPlayers,
          runners: {},
          winner: s.currentPlayer,
          phase: "gameOver",
          message: `Bot wins!`,
        };
        break;
      }
      const np = nextPlayer(s.currentPlayer, s.numPlayers);
      s = {
        ...s,
        players: newPlayers,
        runners: {},
        currentPlayer: np,
        phase: np === 0 ? "preRoll" : "botTurn",
        message: `Bot banked. Your turn!`,
      };
      break;
    }
  }
  if (s.phase === "botTurn") {
    // Safety: end bot turn
    const np = nextPlayer(s.currentPlayer, s.numPlayers);
    s = { ...s, currentPlayer: np, phase: "preRoll", runners: {} };
  }
  return s;
}

function bankRunners(
  player: PlayerProgress,
  runners: Partial<Record<number, number>>,
): PlayerProgress {
  const newBanked = { ...player.banked };
  const newClaimed = { ...player.claimed };
  for (const [col, pos] of Object.entries(runners)) {
    const c = Number(col);
    if (pos !== undefined && pos >= COLUMN_HEIGHTS[c]!) {
      newClaimed[c] = COLUMN_HEIGHTS[c]!;
      delete newBanked[c];
    } else if (pos !== undefined) {
      newBanked[c] = pos;
    }
  }
  return { ...player, banked: newBanked, claimed: newClaimed };
}

export function reducer(state: CantStopState, action: CantStopAction): CantStopState {
  if (state.winner !== null) return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll") return state;
      if (state.currentPlayer !== 0) return state;

      const { dice, nextSeed } = rollFour(state.rngSeed);
      const player = state.players[0]!;
      const splits = allSplits(dice);
      const valid = validSplitsFor(splits, state.runners, player);

      if (valid.length === 0) {
        // Busted
        const newPlayers = state.players.map((p, i) =>
          i === 0 ? { ...p } : p, // runners lost, banked unchanged
        );
        return {
          ...state,
          rngSeed: nextSeed,
          lastRoll: dice,
          validSplits: [],
          phase: "busted",
          players: newPlayers,
          message: "No valid splits — you busted! Turn lost.",
        };
      }

      if (valid.length === 1) {
        // Auto-pick only split
        const newRunners = applyRunners(state.runners, valid[0]!, player);
        return {
          ...state,
          rngSeed: nextSeed,
          lastRoll: dice,
          runners: newRunners,
          validSplits: valid,
          phase: "preRoll",
          message: `Rolled ${dice.join(",")}. Auto-picked split ${valid[0]![0]}+${valid[0]![1]}. Bank or keep rolling!`,
        };
      }

      return {
        ...state,
        rngSeed: nextSeed,
        lastRoll: dice,
        validSplits: valid,
        phase: "pickSplit",
        message: `Rolled ${dice.join(",")}. Pick a split!`,
      };
    }

    case "pickSplit": {
      if (state.phase !== "pickSplit") return state;
      if (state.currentPlayer !== 0) return state;

      const { pairs } = action;
      const player = state.players[0]!;
      // Validate
      const key = [Math.min(pairs[0], pairs[1]), Math.max(pairs[0], pairs[1])].join(",");
      const validKey = state.validSplits.find(
        (s) => [Math.min(s[0], s[1]), Math.max(s[0], s[1])].join(",") === key,
      );
      if (!validKey) return state;

      const newRunners = applyRunners(state.runners, pairs, player);
      return {
        ...state,
        runners: newRunners,
        phase: "preRoll",
        message: "Split picked. Bank or keep rolling!",
      };
    }

    case "bank": {
      if (state.phase !== "preRoll") return state;
      if (state.currentPlayer !== 0) return state;
      if (Object.keys(state.runners).length === 0) return state;

      const player = state.players[0]!;
      const updatedPlayer = bankRunners(player, state.runners);
      const newPlayers = state.players.map((p, i) =>
        i === 0 ? updatedPlayer : p,
      );

      if (checkWin(updatedPlayer)) {
        return {
          ...state,
          players: newPlayers,
          runners: {},
          winner: 0,
          phase: "gameOver",
          message: "You win! 3 columns claimed!",
        };
      }

      const np = nextPlayer(0, state.numPlayers) as PlayerIdx;
      const afterBank: CantStopState = {
        ...state,
        players: newPlayers,
        runners: {},
        currentPlayer: np,
        phase: np === 0 ? "preRoll" : "botTurn",
        message: "Banked! Bot's turn...",
      };

      if (np !== 0) return runBotTurn(afterBank);
      return afterBank;
    }

    case "continue": {
      if (state.phase !== "busted") return state;
      const np = nextPlayer(0, state.numPlayers) as PlayerIdx;
      const afterBust: CantStopState = {
        ...state,
        runners: {},
        currentPlayer: np,
        phase: np === 0 ? "preRoll" : "botTurn",
        message: np === 0 ? "Your turn." : "Bot's turn...",
      };
      if (np !== 0) return runBotTurn(afterBust);
      return afterBust;
    }

    default:
      return state;
  }
}

export function isTerminal(state: CantStopState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
