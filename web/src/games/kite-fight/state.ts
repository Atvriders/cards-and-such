import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Kite Fight: maneuver your kite to cut opponents' strings
// Position your kite strategically; wind shifts direction each round

export type WindDir = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
export type KiteColor = "red" | "blue" | "green" | "yellow";

export interface Kite {
  id: number;
  color: KiteColor;
  x: number;       // 0-8 grid
  y: number;       // 0-8 grid
  string: number;  // line length 10-100
  alive: boolean;
  isPlayer: boolean;
}

export interface KiteFightState {
  rngSeed: number;
  round: number;
  maxRounds: number;
  windDir: WindDir;
  kites: Kite[];
  playerKiteId: number;
  score: number;
  cuts: number;
  phase: "move" | "wind" | "done";
  message: string;
}

const WIND_DIRS: WindDir[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const COLORS: KiteColor[] = ["red", "blue", "green", "yellow"];

function randomWindDir(rng: () => number): WindDir {
  return WIND_DIRS[Math.floor(rng() * 8) % 8] ?? "N";
}

function makeKites(rng: () => number): Kite[] {
  const positions = [
    { x: 4, y: 4 }, // player center
    { x: 1, y: 1 },
    { x: 7, y: 1 },
    { x: 1, y: 7 },
  ];
  return positions.map((pos, i) => ({
    id: i,
    color: COLORS[i % 4] ?? "red" as KiteColor,
    x: pos.x + Math.floor(rng() * 3) - 1,
    y: pos.y + Math.floor(rng() * 3) - 1,
    string: 50 + Math.floor(rng() * 30),
    alive: true,
    isPlayer: i === 0,
  }));
}

export function initialState(seed: number): KiteFightState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const rng2 = mulberry32(nextSeed);
  const kites = makeKites(rng2);
  return {
    rngSeed: nextSeed,
    round: 1,
    maxRounds: 15,
    windDir: randomWindDir(rng),
    kites,
    playerKiteId: 0,
    score: 0,
    cuts: 0,
    phase: "move",
    message: "Move your kite to cut opponents!",
  };
}

function applyWindToKite(kite: Kite, wind: WindDir): Kite {
  if (!kite.alive) return kite;
  const dx = wind.includes("E") ? 1 : wind.includes("W") ? -1 : 0;
  const dy = wind.includes("S") ? 1 : wind.includes("N") ? -1 : 0;
  return {
    ...kite,
    x: Math.max(0, Math.min(8, kite.x + dx)),
    y: Math.max(0, Math.min(8, kite.y + dy)),
    string: Math.max(0, kite.string - 2),
  };
}

function checkCuts(kites: Kite[], prevKites: Kite[]): { kites: Kite[]; cuts: number } {
  let cuts = 0;
  const player = kites.find(k => k.isPlayer && k.alive);
  if (!player) return { kites, cuts };

  const newKites = kites.map(k => {
    if (k.isPlayer || !k.alive) return k;
    // if same position as player, cut!
    if (k.x === player.x && k.y === player.y) {
      cuts++;
      return { ...k, alive: false };
    }
    // adjacent cells = risky, 50% cut chance (simulated via string < 20)
    const dist = Math.abs(k.x - player.x) + Math.abs(k.y - player.y);
    if (dist === 1 && k.string < 30) {
      cuts++;
      return { ...k, alive: false };
    }
    return k;
  });
  return { kites: newKites, cuts };
}

export type KiteAction =
  | { type: "movePlayer"; dx: number; dy: number }
  | { type: "confirmMove" };

export function reducer(state: KiteFightState, action: KiteAction): KiteFightState {
  if (state.phase === "done") return state;

  const player = state.kites.find(k => k.id === state.playerKiteId && k.alive);
  if (!player) return { ...state, phase: "done" };

  if (action.type === "movePlayer") {
    const newX = Math.max(0, Math.min(8, player.x + action.dx));
    const newY = Math.max(0, Math.min(8, player.y + action.dy));
    const newKites = state.kites.map(k =>
      k.id === state.playerKiteId ? { ...k, x: newX, y: newY } : k
    );
    return { ...state, kites: newKites };
  }

  if (action.type === "confirmMove") {
    if (state.phase !== "move") return state;
    // Check cuts after player moves
    const { kites: afterCut, cuts: newCuts } = checkCuts(state.kites, state.kites);

    // Apply wind to opponents
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const newWind = randomWindDir(rng);
    const windKites = afterCut.map(k => k.isPlayer ? k : applyWindToKite(k, state.windDir));

    // Opponents with string < 10 crash
    const crashedKites = windKites.map(k =>
      (!k.isPlayer && k.string < 10) ? { ...k, alive: false } : k
    );

    const aliveOpponents = crashedKites.filter(k => !k.isPlayer && k.alive).length;
    const newRound = state.round + 1;
    const phase = (aliveOpponents === 0 || newRound > state.maxRounds) ? "done" : "move";
    const msg = newCuts > 0
      ? `Cut ${newCuts} kite${newCuts > 1 ? "s" : ""}! Wind: ${newWind}`
      : `Wind shifts ${newWind}. ${aliveOpponents} kites remain.`;

    return {
      ...state,
      rngSeed: nextSeed,
      round: newRound,
      windDir: newWind,
      kites: crashedKites,
      score: state.score + newCuts * 30 + (aliveOpponents === 0 ? 100 : 0),
      cuts: state.cuts + newCuts,
      phase,
      message: msg,
    };
  }

  return state;
}

export function isTerminal(state: KiteFightState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.min(100, Math.round(state.score / 2)) };
}
