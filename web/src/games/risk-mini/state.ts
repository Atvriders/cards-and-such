import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const N_TERR = 5;
export const TERRITORY_NAMES = ["Alpha", "Bravo", "Charlie", "Delta", "Echo"];

export type Owner = "p" | "c";

export interface RiskSettings { dummy: boolean; }
export interface RiskState {
  rngSeed: number;
  armies: number[];   // length N_TERR
  owner: Owner[];     // length N_TERR
  selected: number | null; // attacker territory
  target: number | null;   // target territory
  turn: number;
  phase: "select-attacker" | "select-target" | "resolve" | "ai" | "done";
  message: string;
}
export type RiskAction = { type: "select"; idx: number } | { type: "attack" } | { type: "ai" } | { type: "end" };

export function initialState(seed: number, _s: RiskSettings): RiskState {
  // Player owns first 3, CPU owns last 2 with extra armies
  return {
    rngSeed: seed,
    armies: [4, 3, 3, 5, 4],
    owner: ["p", "p", "p", "c", "c"],
    selected: null, target: null,
    turn: 1, phase: "select-attacker", message: "Pick your attacker.",
  };
}

function rollDice(rng: () => number, n: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < n; i++) arr.push(1 + Math.floor(rng() * 6));
  return arr.sort((a, b) => b - a);
}

function checkWin(state: RiskState): "p" | "c" | null {
  const allP = state.owner.every(o => o === "p");
  const allC = state.owner.every(o => o === "c");
  return allP ? "p" : allC ? "c" : null;
}

export function reducer(state: RiskState, action: RiskAction): RiskState {
  if (state.phase === "done") return state;
  if (action.type === "select" && state.phase === "select-attacker") {
    if (state.owner[action.idx] !== "p" || state.armies[action.idx]! < 2) return state;
    return { ...state, selected: action.idx, phase: "select-target", message: "Pick a target." };
  }
  if (action.type === "select" && state.phase === "select-target") {
    if (state.owner[action.idx] === "p") return { ...state, selected: action.idx, message: "Pick enemy target." };
    return { ...state, target: action.idx, phase: "resolve", message: `Attack from ${state.selected!} to ${action.idx}?` };
  }
  if (action.type === "attack" && state.phase === "resolve" && state.selected !== null && state.target !== null) {
    const rng = mulberry32(state.rngSeed);
    const att = state.armies[state.selected]! - 1;
    const def = state.armies[state.target]!;
    const aDice = rollDice(rng, Math.min(3, att));
    const dDice = rollDice(rng, Math.min(2, def));
    let attLoss = 0, defLoss = 0;
    for (let i = 0; i < Math.min(aDice.length, dDice.length); i++) {
      if (aDice[i]! > dDice[i]!) defLoss += 1; else attLoss += 1;
    }
    const armies = state.armies.slice();
    armies[state.selected] = armies[state.selected]! - attLoss;
    armies[state.target] = armies[state.target]! - defLoss;
    const owner = state.owner.slice();
    let msg = `You: -${attLoss}, CPU: -${defLoss}.`;
    if (armies[state.target]! <= 0) {
      // Conquer with remaining attackers (move 1 minimum)
      owner[state.target] = "p";
      armies[state.target] = Math.max(1, armies[state.selected]! - 1);
      armies[state.selected] = 1;
      msg += " Conquered!";
    }
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let next: RiskState = { ...state, rngSeed: nextSeed, armies, owner, selected: null, target: null, phase: "ai", message: msg };
    const w = checkWin(next); if (w) return { ...next, phase: "done", message: w === "p" ? "You won!" : "CPU won." };
    return next;
  }
  if (action.type === "end" && (state.phase === "select-attacker" || state.phase === "select-target")) {
    return { ...state, selected: null, target: null, phase: "ai", message: "Ended turn." };
  }
  if (action.type === "ai" && state.phase === "ai") {
    const rng = mulberry32(state.rngSeed);
    // CPU picks its strongest territory and attacks weakest player one
    const cpuIdxs = state.owner.map((o, i) => ({ o, i, a: state.armies[i]! })).filter(x => x.o === "c" && x.a >= 2);
    const playerIdxs = state.owner.map((o, i) => ({ o, i, a: state.armies[i]! })).filter(x => x.o === "p");
    const armies = state.armies.slice();
    const owner = state.owner.slice();
    let msg = "CPU passes.";
    if (cpuIdxs.length > 0 && playerIdxs.length > 0) {
      cpuIdxs.sort((a, b) => b.a - a.a);
      playerIdxs.sort((a, b) => a.a - b.a);
      const att = cpuIdxs[0]!.i; const tgt = playerIdxs[0]!.i;
      const aDice = rollDice(rng, Math.min(3, armies[att]! - 1));
      const dDice = rollDice(rng, Math.min(2, armies[tgt]!));
      let attLoss = 0, defLoss = 0;
      for (let i = 0; i < Math.min(aDice.length, dDice.length); i++) {
        if (aDice[i]! > dDice[i]!) defLoss += 1; else attLoss += 1;
      }
      armies[att] = armies[att]! - attLoss;
      armies[tgt] = armies[tgt]! - defLoss;
      msg = `CPU attacks ${tgt}: you -${defLoss}, CPU -${attLoss}.`;
      if (armies[tgt]! <= 0) { owner[tgt] = "c"; armies[tgt] = Math.max(1, armies[att]! - 1); armies[att] = 1; msg += " Conquered!"; }
    }
    // Reinforce: each side gets +1 army on a random owned territory
    const pOwned = owner.map((o, i) => ({ o, i })).filter(x => x.o === "p");
    if (pOwned.length > 0) {
      const idx = pOwned[Math.floor(rng() * pOwned.length)]!.i;
      armies[idx] = armies[idx]! + 1;
    }
    const cOwned = owner.map((o, i) => ({ o, i })).filter(x => x.o === "c");
    if (cOwned.length > 0) {
      const idx = cOwned[Math.floor(rng() * cOwned.length)]!.i;
      armies[idx] = armies[idx]! + 1;
    }
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let next: RiskState = { ...state, rngSeed: nextSeed, armies, owner, turn: state.turn + 1, phase: "select-attacker", message: msg + " Your turn." };
    const w = checkWin(next); if (w) return { ...next, phase: "done", message: w === "p" ? "You won!" : "CPU won." };
    if (next.turn > 30) {
      const pCount = next.owner.filter(o => o === "p").length;
      return { ...next, phase: "done", message: pCount >= 3 ? "You hold most." : "CPU dominates." };
    }
    return next;
  }
  return state;
}

export function score(s: RiskState): number {
  const pTerritories = s.owner.filter(o => o === "p").length;
  const pArmies = s.armies.reduce((acc, a, i) => acc + (s.owner[i] === "p" ? a : 0), 0);
  const win = s.message.startsWith("You won") ? 500 : 0;
  return Math.max(0, win + pTerritories * 50 + pArmies * 5);
}
export function isTerminal(s: RiskState): { score: number } | null { return s.phase === "done" ? { score: score(s) } : null; }
