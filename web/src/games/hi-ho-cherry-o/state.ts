import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Hi Ho! Cherry-O — luck spinner game
// Each player starts with 10 cherries on their tree.
// Spin result: pick 1, 2, 3, 4 cherries; OR spill bucket (lose all bucket cherries);
// OR bird (lose 2 from bucket); OR dog (lose 2 from bucket).
// First to empty their tree (all cherries in bucket) wins.

export interface HiHoSettings {
  // no configurable settings
  dummy: "yes";
}

export type SpinResult = "pick1" | "pick2" | "pick3" | "pick4" | "spill" | "bird" | "dog";

export const SPIN_FACES: SpinResult[] = ["pick1", "pick2", "pick3", "pick4", "spill", "bird", "dog"];

export const TOTAL_CHERRIES = 10;

export interface PlayerState {
  tree: number; // cherries remaining on tree
  bucket: number; // cherries in bucket
}

export interface HiHoState {
  settings: HiHoSettings;
  rngSeed: number;
  players: readonly PlayerState[]; // 0 = human, 1-3 = bots
  numPlayers: number;
  turn: number;
  lastSpin: SpinResult | null;
  winner: number | null;
  message: string;
}

export type HiHoAction = { type: "spin" };

export function initialState(seed: number, _settings: HiHoSettings): HiHoState {
  const numPlayers = 4; // always 1 human + 3 bots
  const players: PlayerState[] = Array.from({ length: numPlayers }, () => ({
    tree: TOTAL_CHERRIES,
    bucket: 0,
  }));
  return {
    settings: _settings,
    rngSeed: seed,
    players,
    numPlayers,
    turn: 0,
    lastSpin: null,
    winner: null,
    message: "Spin to pick cherries from your tree!",
  };
}

function spin(seed: number): { result: SpinResult; nextSeed: number } {
  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * SPIN_FACES.length);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { result: SPIN_FACES[idx]!, nextSeed };
}

function applySpinToPlayer(p: PlayerState, result: SpinResult): { player: PlayerState; msg: string } {
  let { tree, bucket } = p;

  switch (result) {
    case "pick1":
    case "pick2":
    case "pick3":
    case "pick4": {
      const count = parseInt(result[4]!);
      const picked = Math.min(count, tree);
      tree -= picked;
      bucket += picked;
      return { player: { tree, bucket }, msg: `Pick ${count} cherry${count > 1 ? "ies" : ""}` };
    }
    case "spill":
      // Lose all bucket cherries — they go back to the tree
      tree += bucket;
      bucket = 0;
      return { player: { tree, bucket }, msg: "Spill! All cherries back to tree!" };
    case "bird":
    case "dog": {
      const lose = Math.min(2, bucket);
      tree += lose;
      bucket -= lose;
      return { player: { tree, bucket }, msg: `${result === "bird" ? "Bird" : "Dog"}! Lose 2 cherries from bucket!` };
    }
  }
}

function advanceBots(state: HiHoState): HiHoState {
  let s = state;
  let iter = 0;
  while (s.winner === null && s.turn !== 0 && iter++ < 500) {
    const { result, nextSeed } = spin(s.rngSeed);
    const player = s.turn;
    const { player: newP, msg } = applySpinToPlayer(s.players[player]!, result);
    const newPlayers = [...s.players] as PlayerState[];
    newPlayers[player] = newP;
    const won = newP.tree === 0;
    const nt = (s.turn + 1) % s.numPlayers;
    s = {
      ...s,
      rngSeed: nextSeed,
      players: newPlayers,
      lastSpin: result,
      turn: won ? s.turn : nt,
      winner: won ? player : null,
      message: `Bot ${player}: ${msg}${won ? " — Bot wins!" : ""}`,
    };
    if (won) break;
  }
  return s;
}

export function reducer(state: HiHoState, action: HiHoAction): HiHoState {
  if (state.winner !== null) return state;
  if (action.type !== "spin") return state;
  if (state.turn !== 0) return state;

  const { result, nextSeed } = spin(state.rngSeed);
  const { player: newP, msg } = applySpinToPlayer(state.players[0]!, result);
  const newPlayers = [...state.players] as PlayerState[];
  newPlayers[0] = newP;
  const won = newP.tree === 0;

  if (won) {
    return {
      ...state,
      rngSeed: nextSeed,
      players: newPlayers,
      lastSpin: result,
      winner: 0,
      message: `You: ${msg} — You win! Tree empty!`,
    };
  }

  const nt = 1; // next bot
  const next: HiHoState = {
    ...state,
    rngSeed: nextSeed,
    players: newPlayers,
    lastSpin: result,
    turn: nt,
    message: `You: ${msg}`,
  };
  return advanceBots(next);
}

export function isTerminal(state: HiHoState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
