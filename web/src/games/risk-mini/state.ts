import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const N_TERR = 6;
export const TERRITORY_NAMES = [
  "Northgate",   // 0
  "Ironpeak",    // 1
  "Sunhold",     // 2
  "Marshwick",   // 3
  "Emberwood",   // 4
  "Stormvale",   // 5
];

// Hex-ish grid layout (cx, cy in 0..1 range for SVG positioning)
export const TERRITORY_LAYOUT: Array<{ x: number; y: number }> = [
  { x: 0.20, y: 0.25 },  // Northgate
  { x: 0.50, y: 0.18 },  // Ironpeak
  { x: 0.80, y: 0.25 },  // Sunhold
  { x: 0.20, y: 0.72 },  // Marshwick
  { x: 0.50, y: 0.80 },  // Emberwood
  { x: 0.80, y: 0.72 },  // Stormvale
];

// Adjacency list — undirected
export const ADJ: number[][] = [
  [1, 3],          // 0 Northgate ↔ Ironpeak, Marshwick
  [0, 2, 4],       // 1 Ironpeak ↔ Northgate, Sunhold, Emberwood
  [1, 5],          // 2 Sunhold ↔ Ironpeak, Stormvale
  [0, 4],          // 3 Marshwick ↔ Northgate, Emberwood
  [1, 3, 5],       // 4 Emberwood ↔ Ironpeak, Marshwick, Stormvale
  [2, 4],          // 5 Stormvale ↔ Sunhold, Emberwood
];

export type Owner = "p" | "c";
export type Phase = "reinforce" | "attack-from" | "attack-to" | "attack-roll" | "fortify-from" | "fortify-to" | "cpu" | "done";

export interface RiskSettings { dummy: boolean; }

export interface RiskState {
  rngSeed: number;
  armies: number[];           // length N_TERR
  owner: Owner[];             // length N_TERR
  selected: number | null;    // attacker / fortify source territory
  target: number | null;      // target / fortify destination
  reserve: number;            // unplaced armies during reinforce
  turn: number;
  phase: Phase;
  attackerDice: number[];     // last roll (sorted desc)
  defenderDice: number[];     // last roll (sorted desc)
  lastAttackLoss: { att: number; def: number } | null;
  message: string;
  log: string[];              // recent events, newest first
}

export const MAX_TURNS = 30;

export type RiskAction =
  | { type: "place" }                                // place 1 reinforce army on selected
  | { type: "select"; idx: number }                  // generic selection
  | { type: "endReinforce" }
  | { type: "rollAttack" }
  | { type: "endAttack" }
  | { type: "fortify"; amount: number }
  | { type: "endFortify" }
  | { type: "cpu" };

export interface RiskAction_PlaceOn { type: "placeOn"; idx: number }

export type RiskActionAll = RiskAction | RiskAction_PlaceOn;

function reinforcementsFor(state: RiskState, who: Owner): number {
  const owned = state.owner.filter(o => o === who).length;
  return Math.max(3, Math.floor(owned / 3));
}

function pushLog(log: string[], msg: string): string[] {
  const next = [msg, ...log];
  return next.slice(0, 6);
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

function endByMaxTurns(state: RiskState): RiskState | null {
  if (state.turn <= MAX_TURNS) return null;
  const pCount = state.owner.filter(o => o === "p").length;
  const cCount = N_TERR - pCount;
  const msg = pCount > cCount ? "Time up — you control more territories. Victory!"
            : cCount > pCount ? "Time up — CPU controls more territories. Defeat."
            : "Time up — a stalemate.";
  return { ...state, phase: "done", message: msg, log: pushLog(state.log, msg) };
}

export function initialState(seed: number, _s: RiskSettings): RiskState {
  // Player: 0,1,2 (top row). CPU: 3,4,5 (bottom row).
  const armies = [4, 4, 4, 4, 4, 4];
  const owner: Owner[] = ["p", "p", "p", "c", "c", "c"];
  const reserve = Math.max(3, Math.floor(3 / 3)); // 3
  return {
    rngSeed: seed,
    armies,
    owner,
    selected: null,
    target: null,
    reserve,
    turn: 1,
    phase: "reinforce",
    attackerDice: [],
    defenderDice: [],
    lastAttackLoss: null,
    message: `Reinforce: place ${reserve} armies on your territories.`,
    log: ["Battle begins. Your turn — reinforce."],
  };
}

export function isAdjacent(a: number, b: number): boolean {
  return ADJ[a]?.includes(b) ?? false;
}

export function reducer(state: RiskState, action: RiskActionAll): RiskState {
  if (state.phase === "done") return state;

  // ───── REINFORCE ─────
  if (state.phase === "reinforce") {
    if (action.type === "select") {
      if (state.owner[action.idx] !== "p") return state;
      return { ...state, selected: action.idx, message: `Selected ${TERRITORY_NAMES[action.idx]}. Place an army.` };
    }
    if (action.type === "place" && state.selected !== null && state.reserve > 0) {
      const armies = state.armies.slice();
      armies[state.selected] = armies[state.selected]! + 1;
      const reserve = state.reserve - 1;
      const next: RiskState = {
        ...state, armies, reserve,
        message: reserve > 0
          ? `+1 army on ${TERRITORY_NAMES[state.selected]}. ${reserve} left.`
          : `All armies placed. Begin attacks.`,
        log: pushLog(state.log, `+1 to ${TERRITORY_NAMES[state.selected]}`),
      };
      if (reserve === 0) return { ...next, selected: null, phase: "attack-from", message: "Attack: pick one of your territories with 2+ armies." };
      return next;
    }
    if (action.type === "placeOn") {
      if (state.owner[action.idx] !== "p" || state.reserve <= 0) return state;
      const armies = state.armies.slice();
      armies[action.idx] = armies[action.idx]! + 1;
      const reserve = state.reserve - 1;
      const next: RiskState = {
        ...state, armies, reserve, selected: action.idx,
        message: reserve > 0
          ? `+1 on ${TERRITORY_NAMES[action.idx]}. ${reserve} left.`
          : `All armies placed. Begin attacks.`,
        log: pushLog(state.log, `+1 to ${TERRITORY_NAMES[action.idx]}`),
      };
      if (reserve === 0) return { ...next, selected: null, phase: "attack-from", message: "Attack: pick one of your territories with 2+ armies." };
      return next;
    }
    if (action.type === "endReinforce") {
      // Auto-place remaining on first owned territory
      let armies = state.armies.slice();
      let placed = 0;
      while (state.reserve - placed > 0) {
        const idx = armies.findIndex((_, i) => state.owner[i] === "p");
        if (idx < 0) break;
        armies[idx] = armies[idx]! + 1;
        placed++;
      }
      return {
        ...state, armies, reserve: 0, selected: null, phase: "attack-from",
        message: "Attack: pick one of your territories with 2+ armies.",
        log: pushLog(state.log, "Reinforce ended."),
      };
    }
  }

  // ───── ATTACK ─────
  if (state.phase === "attack-from") {
    if (action.type === "select") {
      if (state.owner[action.idx] !== "p") return state;
      if (state.armies[action.idx]! < 2) return { ...state, message: "Need 2+ armies to attack." };
      return { ...state, selected: action.idx, phase: "attack-to", message: `From ${TERRITORY_NAMES[action.idx]}: pick an adjacent enemy.` };
    }
    if (action.type === "endAttack") {
      return { ...state, selected: null, target: null, phase: "fortify-from", message: "Fortify (optional): pick a territory to move armies from.", log: pushLog(state.log, "Attack phase ended.") };
    }
  }

  if (state.phase === "attack-to") {
    if (action.type === "select") {
      // Re-pick attacker?
      if (state.owner[action.idx] === "p") {
        if (state.armies[action.idx]! < 2) return { ...state, message: "Need 2+ armies to attack." };
        return { ...state, selected: action.idx, message: `From ${TERRITORY_NAMES[action.idx]}: pick an adjacent enemy.` };
      }
      if (state.selected === null) return state;
      if (!isAdjacent(state.selected, action.idx)) return { ...state, message: `Not adjacent. Pick a neighbor of ${TERRITORY_NAMES[state.selected]}.` };
      return { ...state, target: action.idx, phase: "attack-roll", message: `Attack ${TERRITORY_NAMES[action.idx]}? Roll the dice.` };
    }
    if (action.type === "endAttack") {
      return { ...state, selected: null, target: null, phase: "fortify-from", message: "Fortify (optional): pick a territory to move armies from.", log: pushLog(state.log, "Attack phase ended.") };
    }
  }

  if (state.phase === "attack-roll") {
    if (action.type === "rollAttack" && state.selected !== null && state.target !== null) {
      const rng = mulberry32(state.rngSeed);
      const fromIdx = state.selected;
      const toIdx = state.target;
      const attCount = Math.min(3, state.armies[fromIdx]! - 1);
      const defCount = Math.min(2, state.armies[toIdx]!);
      const aDice = rollDice(rng, attCount);
      const dDice = rollDice(rng, defCount);
      let attLoss = 0, defLoss = 0;
      for (let i = 0; i < Math.min(aDice.length, dDice.length); i++) {
        if (aDice[i]! > dDice[i]!) defLoss += 1; else attLoss += 1;
      }
      const armies = state.armies.slice();
      armies[fromIdx] = armies[fromIdx]! - attLoss;
      armies[toIdx] = armies[toIdx]! - defLoss;
      const owner = state.owner.slice();
      let msg = `Attack: you ${aDice.join(",")} vs CPU ${dDice.join(",")}. You −${attLoss}, CPU −${defLoss}.`;
      let log = pushLog(state.log, `${TERRITORY_NAMES[fromIdx]}→${TERRITORY_NAMES[toIdx]}: −${attLoss}/−${defLoss}`);
      let next: RiskState = {
        ...state, armies, owner,
        attackerDice: aDice, defenderDice: dDice,
        lastAttackLoss: { att: attLoss, def: defLoss },
        message: msg,
        log,
      };
      if (armies[toIdx]! <= 0) {
        // Conquer — move all but 1 attacking armies in
        const movers = Math.max(attCount, 1);
        owner[toIdx] = "p";
        armies[toIdx] = movers;
        armies[fromIdx] = armies[fromIdx]! - movers;
        if (armies[fromIdx]! < 1) armies[fromIdx] = 1;
        next = {
          ...next, armies, owner,
          message: `${TERRITORY_NAMES[toIdx]} conquered! Continue or end attacks.`,
          log: pushLog(log, `Conquered ${TERRITORY_NAMES[toIdx]}!`),
        };
      }
      const nextSeed = Math.floor(rng() * 2 ** 31);
      next = { ...next, rngSeed: nextSeed };
      const w = checkWin(next);
      if (w === "p") return { ...next, phase: "done", message: "Total conquest — you win!", log: pushLog(next.log, "VICTORY") };
      // Stay in attack mode — return to attack-from so player can pick again
      return { ...next, selected: null, target: null, phase: "attack-from" };
    }
    if (action.type === "endAttack") {
      return { ...state, selected: null, target: null, phase: "fortify-from", message: "Fortify (optional): pick a territory to move armies from.", log: pushLog(state.log, "Attack phase ended.") };
    }
  }

  // ───── FORTIFY ─────
  if (state.phase === "fortify-from") {
    if (action.type === "select") {
      if (state.owner[action.idx] !== "p") return state;
      if (state.armies[action.idx]! < 2) return { ...state, message: "Need 2+ armies to fortify from there." };
      return { ...state, selected: action.idx, phase: "fortify-to", message: `Move armies from ${TERRITORY_NAMES[action.idx]} to an adjacent friendly.` };
    }
    if (action.type === "endFortify") {
      // End turn — go to CPU
      return { ...state, selected: null, target: null, phase: "cpu", message: "CPU is taking its turn...", log: pushLog(state.log, "Your turn ended.") };
    }
  }

  if (state.phase === "fortify-to") {
    if (action.type === "select") {
      if (state.owner[action.idx] === "p") {
        if (state.selected !== null && action.idx !== state.selected && isAdjacent(state.selected, action.idx)) {
          return { ...state, target: action.idx, message: `Move armies from ${TERRITORY_NAMES[state.selected]} → ${TERRITORY_NAMES[action.idx]}?` };
        }
        // Re-pick source
        if (state.armies[action.idx]! < 2) return { ...state, message: "Need 2+ armies to fortify from there." };
        return { ...state, selected: action.idx, target: null, message: `Move armies from ${TERRITORY_NAMES[action.idx]} to an adjacent friendly.` };
      }
      return state;
    }
    if (action.type === "fortify" && state.selected !== null && state.target !== null) {
      const max = state.armies[state.selected]! - 1;
      const amount = Math.max(1, Math.min(action.amount, max));
      const armies = state.armies.slice();
      armies[state.selected] = armies[state.selected]! - amount;
      armies[state.target] = armies[state.target]! + amount;
      return {
        ...state, armies, selected: null, target: null, phase: "cpu",
        message: "CPU is taking its turn...",
        log: pushLog(state.log, `Fortified +${amount} to ${TERRITORY_NAMES[state.target]}`),
      };
    }
    if (action.type === "endFortify") {
      return { ...state, selected: null, target: null, phase: "cpu", message: "CPU is taking its turn...", log: pushLog(state.log, "Your turn ended.") };
    }
  }

  // ───── CPU TURN ─────
  if (state.phase === "cpu" && action.type === "cpu") {
    const rng = mulberry32(state.rngSeed);
    let armies = state.armies.slice();
    let owner = state.owner.slice();
    let log = state.log.slice();

    // CPU reinforce
    let cpuReserve = Math.max(3, Math.floor(owner.filter(o => o === "c").length / 3));
    while (cpuReserve > 0) {
      // Place on weakest CPU territory adjacent to player
      const cpuOwned = owner.map((o, i) => ({ o, i, a: armies[i]! })).filter(x => x.o === "c");
      if (cpuOwned.length === 0) break;
      // Prefer borders — territory with player neighbor
      const borders = cpuOwned.filter(x => ADJ[x.i]!.some(n => owner[n] === "p"));
      const pool = borders.length > 0 ? borders : cpuOwned;
      pool.sort((a, b) => a.a - b.a);
      armies[pool[0]!.i] += 1;
      cpuReserve--;
    }
    log = pushLog(log, "CPU reinforces.");

    // CPU attacks: greedy — strongest CPU vs weakest adjacent player, repeat up to 3 times if winning
    let attacks = 0;
    while (attacks < 3) {
      const cpuCandidates = owner.map((o, i) => ({ o, i, a: armies[i]! }))
        .filter(x => x.o === "c" && x.a >= 3) // need at least 3 to bother
        .sort((a, b) => b.a - a.a);
      if (cpuCandidates.length === 0) break;
      let attacked = false;
      for (const c of cpuCandidates) {
        const targets = ADJ[c.i]!.filter(n => owner[n] === "p")
          .map(n => ({ i: n, a: armies[n]! }))
          .sort((a, b) => a.a - b.a);
        if (targets.length === 0) continue;
        const tgt = targets[0]!;
        // Only attack if CPU has more armies than defender (greedy)
        if (c.a <= tgt.a) continue;
        const attCount = Math.min(3, c.a - 1);
        const defCount = Math.min(2, tgt.a);
        const aDice = rollDice(rng, attCount);
        const dDice = rollDice(rng, defCount);
        let attLoss = 0, defLoss = 0;
        for (let i = 0; i < Math.min(aDice.length, dDice.length); i++) {
          if (aDice[i]! > dDice[i]!) defLoss += 1; else attLoss += 1;
        }
        armies[c.i] -= attLoss;
        armies[tgt.i] -= defLoss;
        log = pushLog(log, `CPU ${TERRITORY_NAMES[c.i]}→${TERRITORY_NAMES[tgt.i]}: you −${defLoss}, CPU −${attLoss}`);
        if (armies[tgt.i]! <= 0) {
          const movers = Math.max(attCount, 1);
          owner[tgt.i] = "c";
          armies[tgt.i] = movers;
          armies[c.i] = armies[c.i]! - movers;
          if (armies[c.i]! < 1) armies[c.i] = 1;
          log = pushLog(log, `CPU conquered ${TERRITORY_NAMES[tgt.i]}!`);
        }
        attacked = true;
        attacks++;
        break;
      }
      if (!attacked) break;
    }

    const nextSeed = Math.floor(rng() * 2 ** 31);
    const nextTurn = state.turn + 1;
    let next: RiskState = {
      ...state,
      rngSeed: nextSeed,
      armies, owner,
      selected: null, target: null,
      attackerDice: [], defenderDice: [], lastAttackLoss: null,
      turn: nextTurn,
      phase: "reinforce",
      reserve: 0,
      message: "",
      log,
    };
    const w = checkWin(next);
    if (w === "c") return { ...next, phase: "done", message: "CPU has conquered the map. Defeat.", log: pushLog(next.log, "DEFEAT") };
    if (w === "p") return { ...next, phase: "done", message: "Total conquest — you win!", log: pushLog(next.log, "VICTORY") };
    const timeUp = endByMaxTurns(next);
    if (timeUp) return timeUp;
    // Begin player's reinforce
    const pOwned = owner.filter(o => o === "p").length;
    if (pOwned === 0) return { ...next, phase: "done", message: "CPU has conquered the map. Defeat.", log: pushLog(next.log, "DEFEAT") };
    const reserve = Math.max(3, Math.floor(pOwned / 3));
    return {
      ...next,
      reserve,
      message: `Turn ${nextTurn}. Reinforce: place ${reserve} armies on your territories.`,
      log: pushLog(next.log, `Turn ${nextTurn} — reinforce.`),
    };
  }

  return state;
}

export function score(s: RiskState): number {
  const pTerritories = s.owner.filter(o => o === "p").length;
  const pArmies = s.armies.reduce((acc, a, i) => acc + (s.owner[i] === "p" ? a : 0), 0);
  const win = s.message.startsWith("Total conquest") ? 600 : 0;
  return Math.max(0, win + pTerritories * 60 + pArmies * 4);
}

export function isTerminal(s: RiskState): { score: number } | null {
  return s.phase === "done" ? { score: score(s) } : null;
}
