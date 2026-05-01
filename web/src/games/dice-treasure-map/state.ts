import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TILES = 12;
export const DIGS = 8;

export interface DiceTreasureMapSettings { dummy: boolean; }

export interface DiceTreasureMapState {
  rngSeed: number;
  digsLeft: number;
  revealed: number[];
  treasures: number[];
  rolls: [number, number] | null;
  score: number;
  phase: "choose" | "result" | "done";
  log: string;
  lastTile: number | null;
  lastTreasure: boolean;
}

export type DiceTreasureMapAction = { type: "dig" } | { type: "next" };

function makeTreasures(rng: () => number): number[] {
  const out: number[] = [];
  while (out.length < 5) {
    const t = Math.floor(rng() * TILES);
    if (!out.includes(t)) out.push(t);
  }
  return out;
}

export function initialState(seed: number, _settings: DiceTreasureMapSettings): DiceTreasureMapState {
  const rng = mulberry32(seed);
  const treasures = makeTreasures(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rngSeed: nextSeed, digsLeft: DIGS, revealed: [], treasures, rolls: null, score: 0, phase: "choose", log: "", lastTile: null, lastTreasure: false };
}

export function reducer(state: DiceTreasureMapState, action: DiceTreasureMapAction): DiceTreasureMapState {
  if (state.phase === "done") return state;
  if (action.type === "dig" && state.phase === "choose" && state.digsLeft > 0) {
    const rng = mulberry32(state.rngSeed);
    const r1 = 1 + Math.floor(rng() * 6);
    const r2 = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const tile = ((r1 - 1) * 2 + (r2 % 2 === 0 ? 1 : 0)) % TILES;
    let revealed = state.revealed;
    let log = "";
    let pts = 0;
    let hit = false;
    if (revealed.includes(tile)) {
      log = `Tile ${tile + 1} already dug.`;
    } else {
      revealed = [...revealed, tile];
      if (state.treasures.includes(tile)) {
        pts = r1 + r2 + 6;
        hit = true;
        log = `Tile ${tile + 1}: TREASURE +${pts}!`;
      } else {
        log = `Tile ${tile + 1}: empty.`;
      }
    }
    const digsLeft = state.digsLeft - 1;
    const allFound = state.treasures.every(t => revealed.includes(t));
    let phase: DiceTreasureMapState["phase"] = "result";
    let score = state.score + pts;
    if (digsLeft <= 0 || allFound) {
      if (allFound) score += 30;
      phase = "done";
      log += allFound ? " All treasure uncovered! +30." : " Map closes.";
    }
    return { ...state, rngSeed: nextSeed, rolls: [r1, r2], digsLeft, revealed, score, phase, log, lastTile: tile, lastTreasure: hit };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "choose", rolls: null, log: "", lastTile: null, lastTreasure: false };
  }
  return state;
}

export function isTerminal(state: DiceTreasureMapState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
