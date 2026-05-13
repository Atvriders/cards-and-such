// risk-full — Risk (Full World Domination) — 1 human vs 1 CPU.
//
// AI strategy (CPU "Crimson Empire"):
//   1. REINFORCE — receives armies = max(3, floor(owned/3)) + continent bonuses + auto-cashes
//      any card set whenever it holds ≥3 cards. Reinforcements are distributed:
//        a) +1 to each border territory whose army count is below a player neighbor's
//           (with a small cap so it doesn't all go to one place).
//        b) Any leftover armies go to the weakest border territory (one with the
//           smallest army count relative to its largest player neighbor).
//        c) If no borders exist (impossible mid-game unless CPU is eliminated),
//           pile onto the strongest CPU territory.
//      Heuristic prefers reinforcing continents the CPU fully holds so it keeps
//      the bonus, and contested continents where the CPU is one or two territories
//      away from completing a bonus.
//
//   2. ATTACK — greedy multi-step:
//        a) Find every (att, def) pair where CPU territory has ≥ def+1 armies
//           (a real numerical advantage). Sort by "value" = defender army count
//           ascending (weakest defender first), with a tie-breaker favouring
//           targets that complete a CPU continent.
//        b) Attack repeatedly until the attacker has only 2 armies left, or until
//           a defender wins (loss > advantage). Re-pick a new pair each round
//           because losses change the picture.
//        c) Stop after at most 8 successful conquests OR 20 attack rolls per
//           turn (prevents runaway dice loops in unfortunate seeds).
//
//   3. FORTIFY — pull one stack from a deep interior territory (no enemy
//      neighbours) toward the largest border territory along the shortest
//      friendly path. Moves up to (armies-1) so internal forces don't go to
//      waste.
//
//   4. CARD TRADE — automatic when CPU is forced (hand of 5+) or whenever
//      cashing in would let it conquer at least one territory it currently can't.
//
// TODO (omitted advanced rules, XL tier):
//   - Multiple human players (this is strictly 1H vs 1CPU)
//   - Mission / secret-objective variant
//   - 2-player neutral army variant
//   - Territory card placement bonus (+2 if territory you own appears on a
//     traded card) — we award the +2 only if a SINGLE traded card matches,
//     to keep the UI sane.
//   - Capital cities, fortresses, capital-Risk variant
//   - Naval invasions beyond the standard four sea routes (Kamchatka↔Alaska
//     is included, Iceland↔Greenland is included, etc.)
//   - Tournament card-trade values past 60 (game usually decides well before).

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ───── World Map ─────────────────────────────────────────────────────────

export const CONTINENTS = [
  { id: "na", name: "North America", bonus: 5 },
  { id: "sa", name: "South America", bonus: 2 },
  { id: "eu", name: "Europe",        bonus: 5 },
  { id: "af", name: "Africa",        bonus: 3 },
  { id: "as", name: "Asia",          bonus: 7 },
  { id: "au", name: "Australia",     bonus: 2 },
] as const;

export type ContinentId = typeof CONTINENTS[number]["id"];

// 42 territories. Order matters — adjacency uses these indices.
export interface Territory {
  name: string;
  cont: ContinentId;
  x: number;          // 0..1 layout for SVG
  y: number;
}

export const TERRITORIES: Territory[] = [
  // North America (0..8) — 9 territories
  { name: "Alaska",            cont: "na", x: 0.05, y: 0.20 },  // 0
  { name: "Northwest Terr.",   cont: "na", x: 0.16, y: 0.18 },  // 1
  { name: "Greenland",         cont: "na", x: 0.32, y: 0.10 },  // 2
  { name: "Alberta",           cont: "na", x: 0.13, y: 0.28 },  // 3
  { name: "Ontario",           cont: "na", x: 0.20, y: 0.28 },  // 4
  { name: "Quebec",            cont: "na", x: 0.27, y: 0.28 },  // 5
  { name: "Western US",        cont: "na", x: 0.14, y: 0.38 },  // 6
  { name: "Eastern US",        cont: "na", x: 0.22, y: 0.38 },  // 7
  { name: "Central America",   cont: "na", x: 0.16, y: 0.50 },  // 8

  // South America (9..12) — 4 territories
  { name: "Venezuela", cont: "sa", x: 0.22, y: 0.58 },  // 9
  { name: "Peru",      cont: "sa", x: 0.22, y: 0.72 },  // 10
  { name: "Brazil",    cont: "sa", x: 0.30, y: 0.68 },  // 11
  { name: "Argentina", cont: "sa", x: 0.23, y: 0.85 },  // 12

  // Europe (13..19) — 7 territories
  { name: "Iceland",       cont: "eu", x: 0.40, y: 0.20 },  // 13
  { name: "Scandinavia",   cont: "eu", x: 0.48, y: 0.18 },  // 14
  { name: "Great Britain", cont: "eu", x: 0.42, y: 0.28 },  // 15
  { name: "N. Europe",     cont: "eu", x: 0.50, y: 0.30 },  // 16
  { name: "W. Europe",     cont: "eu", x: 0.43, y: 0.40 },  // 17
  { name: "S. Europe",     cont: "eu", x: 0.50, y: 0.42 },  // 18
  { name: "Ukraine",       cont: "eu", x: 0.58, y: 0.26 },  // 19

  // Africa (20..25) — 6 territories
  { name: "N. Africa",     cont: "af", x: 0.46, y: 0.55 },  // 20
  { name: "Egypt",         cont: "af", x: 0.54, y: 0.50 },  // 21
  { name: "E. Africa",     cont: "af", x: 0.55, y: 0.62 },  // 22
  { name: "Congo",         cont: "af", x: 0.50, y: 0.70 },  // 23
  { name: "S. Africa",     cont: "af", x: 0.52, y: 0.82 },  // 24
  { name: "Madagascar",    cont: "af", x: 0.60, y: 0.80 },  // 25

  // Asia (26..37) — 12 territories
  { name: "Ural",        cont: "as", x: 0.66, y: 0.22 },  // 26
  { name: "Siberia",     cont: "as", x: 0.72, y: 0.18 },  // 27
  { name: "Yakutsk",     cont: "as", x: 0.82, y: 0.14 },  // 28
  { name: "Kamchatka",   cont: "as", x: 0.92, y: 0.20 },  // 29
  { name: "Irkutsk",     cont: "as", x: 0.78, y: 0.24 },  // 30
  { name: "Mongolia",    cont: "as", x: 0.82, y: 0.32 },  // 31
  { name: "Japan",       cont: "as", x: 0.92, y: 0.34 },  // 32
  { name: "Afghanistan", cont: "as", x: 0.66, y: 0.34 },  // 33
  { name: "China",       cont: "as", x: 0.78, y: 0.40 },  // 34
  { name: "Middle East", cont: "as", x: 0.60, y: 0.45 },  // 35
  { name: "India",       cont: "as", x: 0.70, y: 0.50 },  // 36
  { name: "Siam",        cont: "as", x: 0.80, y: 0.55 },  // 37

  // Australia (38..41) — 4 territories
  { name: "Indonesia",       cont: "au", x: 0.82, y: 0.66 },  // 38
  { name: "New Guinea",      cont: "au", x: 0.92, y: 0.64 },  // 39
  { name: "W. Australia",    cont: "au", x: 0.86, y: 0.80 },  // 40
  { name: "E. Australia",    cont: "au", x: 0.94, y: 0.78 },  // 41
];

export const N_TERR = TERRITORIES.length;   // 42

// Classic Risk adjacency. Each entry is a sorted list of neighbour indices.
// Includes the classic sea routes (Alaska↔Kamchatka, Greenland↔Iceland,
// W.Europe↔N.Africa, S.Europe↔Egypt/N.Africa, E.Africa↔Middle East,
// India↔Siam↔Indonesia, Indonesia↔New Guinea, etc.)
export const ADJ: number[][] = [
  /*  0 Alaska         */ [1, 3, 29],
  /*  1 NW Territory   */ [0, 2, 3, 4],
  /*  2 Greenland      */ [1, 4, 5, 13],
  /*  3 Alberta        */ [0, 1, 4, 6],
  /*  4 Ontario        */ [1, 2, 3, 5, 6, 7],
  /*  5 Quebec         */ [2, 4, 7],
  /*  6 Western US     */ [3, 4, 7, 8],
  /*  7 Eastern US     */ [4, 5, 6, 8],
  /*  8 Cent. America  */ [6, 7, 9],
  /*  9 Venezuela      */ [8, 10, 11],
  /* 10 Peru           */ [9, 11, 12],
  /* 11 Brazil         */ [9, 10, 12, 20],
  /* 12 Argentina      */ [10, 11],
  /* 13 Iceland        */ [2, 14, 15],
  /* 14 Scandinavia    */ [13, 15, 16, 19],
  /* 15 Great Britain  */ [13, 14, 16, 17],
  /* 16 N. Europe      */ [14, 15, 17, 18, 19],
  /* 17 W. Europe      */ [15, 16, 18, 20],
  /* 18 S. Europe      */ [16, 17, 19, 20, 21, 35],
  /* 19 Ukraine        */ [14, 16, 18, 26, 33, 35],
  /* 20 N. Africa      */ [11, 17, 18, 21, 22, 23],
  /* 21 Egypt          */ [18, 20, 22, 35],
  /* 22 E. Africa      */ [20, 21, 23, 24, 25, 35],
  /* 23 Congo          */ [20, 22, 24],
  /* 24 S. Africa      */ [22, 23, 25],
  /* 25 Madagascar     */ [22, 24],
  /* 26 Ural           */ [19, 27, 33, 34],
  /* 27 Siberia        */ [26, 28, 30, 31, 34],
  /* 28 Yakutsk        */ [27, 29, 30],
  /* 29 Kamchatka      */ [0, 28, 30, 31, 32],
  /* 30 Irkutsk        */ [27, 28, 29, 31],
  /* 31 Mongolia       */ [27, 29, 30, 32, 34],
  /* 32 Japan          */ [29, 31],
  /* 33 Afghanistan    */ [19, 26, 34, 35, 36],
  /* 34 China          */ [26, 27, 31, 33, 36, 37],
  /* 35 Middle East    */ [18, 19, 21, 22, 33, 36],
  /* 36 India          */ [33, 34, 35, 37],
  /* 37 Siam           */ [34, 36, 38],
  /* 38 Indonesia      */ [37, 39, 40],
  /* 39 New Guinea     */ [38, 40, 41],
  /* 40 W. Australia   */ [38, 39, 41],
  /* 41 E. Australia   */ [39, 40],
];

export function isAdjacent(a: number, b: number): boolean {
  return ADJ[a]?.includes(b) ?? false;
}

// ───── Types ────────────────────────────────────────────────────────────

export type Owner = "p" | "c";
export type CardKind = "infantry" | "cavalry" | "artillery" | "wild";

export interface Card { kind: CardKind; terr: number; /* -1 for wilds */ }

export type Phase =
  | "place-initial"      // (we use a simplified "draft" — armies pre-distributed)
  | "reinforce"
  | "trade"              // shows trade UI when ≥3 cards (≥5 forces)
  | "attack-from"
  | "attack-to"
  | "attack-roll"
  | "post-conquest"      // pick how many to move into conquered territory
  | "fortify-from"
  | "fortify-to"
  | "fortify-amount"
  | "cpu"
  | "done";

export interface RiskFullSettings {
  startingArmies: number;   // 2p:40, 3p:35, 4p:30, 5+:25 — fixed to 40 in 1v1
  cpuAggression: number;    // 0..2 — affects min army advantage to attack (lower = more aggressive)
}

export interface RiskFullState {
  rngSeed: number;
  armies: number[];                    // length 42
  owner: Owner[];                      // length 42
  reserve: number;                     // unplaced armies during reinforce
  cards: { p: Card[]; c: Card[] };     // hand counts; CPU hand is hidden but tracked
  tradeIndex: number;                  // next set's army value index
  conqueredThisTurn: boolean;          // tracks if a card should be drawn at turn end
  pendingConquest: { from: number; to: number; min: number } | null;

  // Selection
  selected: number | null;
  target: number | null;

  turn: number;
  phase: Phase;

  attackerDice: number[];
  defenderDice: number[];
  lastAttackLoss: { att: number; def: number } | null;

  message: string;
  log: string[];                       // newest first
}

// Card-set escalating values: 4, 6, 8, 10, 12, 15, then +5 each
export function cardSetValue(setsTradedSoFar: number): number {
  const table = [4, 6, 8, 10, 12, 15];
  if (setsTradedSoFar < table.length) return table[setsTradedSoFar]!;
  return 15 + 5 * (setsTradedSoFar - (table.length - 1));
}

// A valid trade set is three cards either (a) three of same kind,
// (b) one of each, or (c) any two + a wild (counts as the matching kind).
export function isValidSet(cards: Card[]): boolean {
  if (cards.length !== 3) return false;
  const wilds = cards.filter(c => c.kind === "wild").length;
  const kinds = cards.filter(c => c.kind !== "wild").map(c => c.kind);
  const uniq = new Set(kinds);
  if (wilds >= 1 && uniq.size <= 2) return true;  // wild fills
  if (uniq.size === 1) return true;                // three of a kind
  if (uniq.size === 3) return true;                // one of each
  return false;
}

// Find the first valid 3-card set indices within a hand.
export function findValidSet(hand: Card[]): number[] | null {
  for (let i = 0; i < hand.length; i++) {
    for (let j = i + 1; j < hand.length; j++) {
      for (let k = j + 1; k < hand.length; k++) {
        if (isValidSet([hand[i]!, hand[j]!, hand[k]!])) return [i, j, k];
      }
    }
  }
  return null;
}

// Continent bonus iff a player owns every territory in that continent.
export function continentBonus(state: RiskFullState, who: Owner): number {
  let bonus = 0;
  for (const cont of CONTINENTS) {
    const all = TERRITORIES.every((t, i) =>
      t.cont !== cont.id || state.owner[i] === who
    );
    if (all) bonus += cont.bonus;
  }
  return bonus;
}

export function reinforcementsFor(state: RiskFullState, who: Owner): number {
  const owned = state.owner.filter(o => o === who).length;
  return Math.max(3, Math.floor(owned / 3)) + continentBonus(state, who);
}

// ───── Actions ──────────────────────────────────────────────────────────

export type RiskFullAction =
  | { type: "placeOn"; idx: number }       // place 1 reinforce army
  | { type: "select"; idx: number }
  | { type: "endReinforce" }                // auto-place any remaining
  | { type: "trade"; indices: [number, number, number] }  // trade a set
  | { type: "skipTrade" }
  | { type: "rollAttack" }
  | { type: "endAttack" }
  | { type: "moveAfterConquest"; amount: number }
  | { type: "fortify"; amount: number }
  | { type: "endFortify" }
  | { type: "cpu" };

// ───── Helpers ──────────────────────────────────────────────────────────

function pushLog(log: string[], msg: string): string[] {
  return [msg, ...log].slice(0, 8);
}

function rollDice(rng: () => number, n: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < n; i++) arr.push(1 + Math.floor(rng() * 6));
  return arr.sort((a, b) => b - a);
}

function checkWin(state: RiskFullState): Owner | null {
  const allP = state.owner.every(o => o === "p");
  const allC = state.owner.every(o => o === "c");
  return allP ? "p" : allC ? "c" : null;
}

function drawCard(rng: () => number, terr: number): Card {
  // Each territory has a fixed kind in classic Risk; we generate one by
  // hashing the territory index for determinism. Plus a small chance of a wild.
  const r = rng();
  if (r < 0.05) return { kind: "wild", terr: -1 };
  const kinds: CardKind[] = ["infantry", "cavalry", "artillery"];
  return { kind: kinds[terr % 3]!, terr };
}

// Initial-army budget for 1v1 = 40 each, then we auto-distribute
// across all owned territories. Half the map is human, half CPU.
export function initialState(seed: number, s: RiskFullSettings): RiskFullState {
  const rng = mulberry32(seed);
  const owner: Owner[] = new Array(N_TERR).fill("p");
  // Shuffle territory indices and alternate ownership for fair distribution.
  const order: number[] = [];
  for (let i = 0; i < N_TERR; i++) order.push(i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  for (let k = 0; k < order.length; k++) {
    owner[order[k]!] = k % 2 === 0 ? "p" : "c";
  }
  // Distribute startingArmies across each side's territories.
  const armies = new Array<number>(N_TERR).fill(1);
  const distribute = (who: Owner, budget: number): void => {
    const indices = owner.map((o, i) => ({ o, i })).filter(x => x.o === who).map(x => x.i);
    let remaining = Math.max(0, budget - indices.length);  // 1 per territory already placed
    let i = 0;
    while (remaining > 0) {
      armies[indices[i % indices.length]!] = armies[indices[i % indices.length]!]! + 1;
      remaining--;
      i++;
    }
  };
  const start = s.startingArmies;
  distribute("p", start);
  distribute("c", start);

  const ownedP = owner.filter(o => o === "p").length;
  const reserve = Math.max(3, Math.floor(ownedP / 3));
  const nextSeed = Math.floor(rng() * 2 ** 31) >>> 0;
  return {
    rngSeed: nextSeed,
    armies,
    owner,
    reserve,
    cards: { p: [], c: [] },
    tradeIndex: 0,
    conqueredThisTurn: false,
    pendingConquest: null,
    selected: null,
    target: null,
    turn: 1,
    phase: "reinforce",
    attackerDice: [],
    defenderDice: [],
    lastAttackLoss: null,
    message: `Turn 1 — Reinforce: place ${reserve} armies on your territories.`,
    log: ["The world map is drawn. Your reinforce phase begins."],
  };
}

// ───── Reducer ──────────────────────────────────────────────────────────

export function reducer(state: RiskFullState, action: RiskFullAction): RiskFullState {
  if (state.phase === "done") return state;

  // ─── REINFORCE / TRADE ─────────────────────────────────────────────
  if (state.phase === "reinforce") {
    if (action.type === "select") {
      if (state.owner[action.idx] !== "p") return state;
      return { ...state, selected: action.idx, message: `Selected ${TERRITORIES[action.idx]!.name}. Place an army.` };
    }
    if (action.type === "placeOn") {
      if (state.owner[action.idx] !== "p" || state.reserve <= 0) return state;
      const armies = state.armies.slice();
      armies[action.idx] = armies[action.idx]! + 1;
      const reserve = state.reserve - 1;
      const next: RiskFullState = {
        ...state, armies, reserve, selected: action.idx,
        message: reserve > 0
          ? `+1 on ${TERRITORIES[action.idx]!.name}. ${reserve} left.`
          : `All armies placed. Begin attacks.`,
        log: pushLog(state.log, `+1 ${TERRITORIES[action.idx]!.name}`),
      };
      if (reserve === 0) {
        return { ...next, selected: null, phase: "attack-from", message: "Attack: pick one of your territories with 2+ armies, or skip." };
      }
      return next;
    }
    if (action.type === "endReinforce") {
      // Auto-place remaining on weakest border territory (or any owned).
      const armies = state.armies.slice();
      const ownedIdx = state.owner.map((o, i) => ({ o, i })).filter(x => x.o === "p").map(x => x.i);
      if (ownedIdx.length === 0) return state;
      let remaining = state.reserve;
      while (remaining > 0) {
        const borders = ownedIdx.filter(i => ADJ[i]!.some(n => state.owner[n] === "c"));
        const pool = borders.length > 0 ? borders : ownedIdx;
        pool.sort((a, b) => armies[a]! - armies[b]!);
        armies[pool[0]!] = armies[pool[0]!]! + 1;
        remaining--;
      }
      return {
        ...state, armies, reserve: 0, selected: null, phase: "attack-from",
        message: "Attack: pick one of your territories with 2+ armies, or skip.",
        log: pushLog(state.log, "Reinforce ended."),
      };
    }
    if (action.type === "trade") {
      const [i, j, k] = action.indices;
      const hand = state.cards.p;
      const set = [hand[i], hand[j], hand[k]].filter(Boolean) as Card[];
      if (!isValidSet(set)) return { ...state, message: "That isn't a valid set (3 of a kind, one of each, or includes a wild)." };
      const bonusArmies = cardSetValue(state.tradeIndex);
      // +2 for one matching territory you own.
      let placementBonus = 0;
      for (const c of set) {
        if (c.kind !== "wild" && c.terr >= 0 && state.owner[c.terr] === "p") {
          placementBonus = 2;
          break;
        }
      }
      const removed = new Set([i, j, k]);
      const newHand = hand.filter((_, idx) => !removed.has(idx));
      const total = bonusArmies + placementBonus;
      return {
        ...state,
        cards: { ...state.cards, p: newHand },
        tradeIndex: state.tradeIndex + 1,
        reserve: state.reserve + total,
        message: `Traded a set for ${bonusArmies} armies${placementBonus ? " (+2 territory bonus)" : ""}. Place them now.`,
        log: pushLog(state.log, `Traded set → +${total} armies`),
      };
    }
    if (action.type === "skipTrade") {
      return state;  // no-op
    }
  }

  // ─── ATTACK ────────────────────────────────────────────────────────
  if (state.phase === "attack-from") {
    if (action.type === "select") {
      if (state.owner[action.idx] !== "p") return state;
      if (state.armies[action.idx]! < 2) return { ...state, message: "Need 2+ armies to attack from there." };
      return { ...state, selected: action.idx, phase: "attack-to", message: `From ${TERRITORIES[action.idx]!.name}: pick an adjacent enemy.` };
    }
    if (action.type === "endAttack") {
      return endAttackPhase(state);
    }
  }

  if (state.phase === "attack-to") {
    if (action.type === "select") {
      if (state.owner[action.idx] === "p") {
        if (state.armies[action.idx]! < 2) return { ...state, message: "Need 2+ armies to attack from there." };
        return { ...state, selected: action.idx, message: `From ${TERRITORIES[action.idx]!.name}: pick an adjacent enemy.` };
      }
      if (state.selected === null) return state;
      if (!isAdjacent(state.selected, action.idx)) {
        return { ...state, message: `Not adjacent. Pick a neighbour of ${TERRITORIES[state.selected]!.name}.` };
      }
      return { ...state, target: action.idx, phase: "attack-roll", message: `Attack ${TERRITORIES[action.idx]!.name}? Roll the dice.` };
    }
    if (action.type === "endAttack") return endAttackPhase(state);
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
      let log = pushLog(state.log, `${TERRITORIES[fromIdx]!.name} → ${TERRITORIES[toIdx]!.name}: −${attLoss}/−${defLoss}`);
      let next: RiskFullState = {
        ...state, armies, owner,
        attackerDice: aDice, defenderDice: dDice,
        lastAttackLoss: { att: attLoss, def: defLoss },
        message: `You ${aDice.join(",")} vs CPU ${dDice.join(",")}. You −${attLoss}, CPU −${defLoss}.`,
        log,
      };
      const nextSeed = Math.floor(rng() * 2 ** 31) >>> 0;
      if (armies[toIdx]! <= 0) {
        // Conquered — enter post-conquest with the user choosing army count.
        owner[toIdx] = "p";
        const min = attCount;     // must move at least the number of dice rolled
        const max = armies[fromIdx]! - 1;
        // Auto-resolve if max <= min
        if (max <= min) {
          armies[toIdx] = min;
          armies[fromIdx] = armies[fromIdx]! - min;
          if (armies[fromIdx]! < 1) armies[fromIdx] = 1;
          next = {
            ...next, armies, owner, rngSeed: nextSeed,
            conqueredThisTurn: true,
            selected: null, target: null,
            phase: "attack-from",
            message: `${TERRITORIES[toIdx]!.name} conquered with ${min}! Continue or end attacks.`,
            log: pushLog(log, `Conquered ${TERRITORIES[toIdx]!.name}!`),
          };
        } else {
          next = {
            ...next, armies, owner, rngSeed: nextSeed,
            conqueredThisTurn: true,
            phase: "post-conquest",
            pendingConquest: { from: fromIdx, to: toIdx, min },
            message: `${TERRITORIES[toIdx]!.name} conquered! Move ${min}–${max} armies in.`,
            log: pushLog(log, `Conquered ${TERRITORIES[toIdx]!.name}!`),
          };
        }
        const w = checkWin(next);
        if (w === "p") return { ...next, phase: "done", message: "Total world domination — VICTORY!", log: pushLog(next.log, "VICTORY") };
        return next;
      }
      // No conquest — stay in attack-roll loop is annoying; bounce to attack-from.
      return { ...next, selected: null, target: null, rngSeed: nextSeed, phase: "attack-from" };
    }
    if (action.type === "endAttack") return endAttackPhase(state);
  }

  if (state.phase === "post-conquest" && action.type === "moveAfterConquest" && state.pendingConquest) {
    const { from, to, min } = state.pendingConquest;
    const max = state.armies[from]! - 1;
    const want = Math.max(min, Math.min(action.amount, max));
    const armies = state.armies.slice();
    armies[to] = want;
    armies[from] = armies[from]! - want;
    if (armies[from]! < 1) armies[from] = 1;
    return {
      ...state, armies,
      selected: null, target: null,
      pendingConquest: null,
      phase: "attack-from",
      message: `${want} armies moved into ${TERRITORIES[to]!.name}. Continue attacks or end phase.`,
      log: pushLog(state.log, `Moved ${want} → ${TERRITORIES[to]!.name}`),
    };
  }

  // ─── FORTIFY ───────────────────────────────────────────────────────
  if (state.phase === "fortify-from") {
    if (action.type === "select") {
      if (state.owner[action.idx] !== "p") return state;
      if (state.armies[action.idx]! < 2) return { ...state, message: "Need 2+ armies to fortify from there." };
      return { ...state, selected: action.idx, phase: "fortify-to", message: `Pick a friendly territory connected by your own chain.` };
    }
    if (action.type === "endFortify") return endTurn(state);
  }

  if (state.phase === "fortify-to") {
    if (action.type === "select") {
      if (state.owner[action.idx] === "p") {
        if (state.selected !== null && action.idx !== state.selected && isConnectedFriendly(state, state.selected, action.idx)) {
          return { ...state, target: action.idx, phase: "fortify-amount", message: `Move armies ${TERRITORIES[state.selected]!.name} → ${TERRITORIES[action.idx]!.name}?` };
        }
        if (state.armies[action.idx]! < 2) return { ...state, message: "Need 2+ armies to fortify from there." };
        return { ...state, selected: action.idx, target: null, message: `Pick a friendly territory connected by your own chain.` };
      }
      return state;
    }
    if (action.type === "endFortify") return endTurn(state);
  }

  if (state.phase === "fortify-amount") {
    if (action.type === "fortify" && state.selected !== null && state.target !== null) {
      const max = state.armies[state.selected]! - 1;
      const amount = Math.max(1, Math.min(action.amount, max));
      const armies = state.armies.slice();
      armies[state.selected] = armies[state.selected]! - amount;
      armies[state.target] = armies[state.target]! + amount;
      const fortified = state.target;
      return endTurn({
        ...state, armies, selected: null, target: null,
        log: pushLog(state.log, `Fortified +${amount} → ${TERRITORIES[fortified]!.name}`),
      });
    }
    if (action.type === "endFortify") return endTurn(state);
  }

  // ─── CPU TURN ──────────────────────────────────────────────────────
  if (state.phase === "cpu" && action.type === "cpu") {
    return runCpuTurn(state);
  }

  return state;
}

function endAttackPhase(state: RiskFullState): RiskFullState {
  // If a territory was conquered, draw a card.
  let next = state;
  if (state.conqueredThisTurn) {
    const rng = mulberry32(state.rngSeed);
    // pick any owned territory as the "card" territory
    const ownedP = state.owner.map((o, i) => ({ o, i })).filter(x => x.o === "p").map(x => x.i);
    const terr = ownedP[Math.floor(rng() * ownedP.length)]!;
    const card = drawCard(rng, terr);
    const nextSeed = Math.floor(rng() * 2 ** 31) >>> 0;
    next = {
      ...state,
      cards: { ...state.cards, p: [...state.cards.p, card] },
      conqueredThisTurn: false,
      rngSeed: nextSeed,
      log: pushLog(state.log, `Drew a ${card.kind} card.`),
    };
  }
  return {
    ...next, selected: null, target: null, phase: "fortify-from",
    message: "Fortify (optional): pick a territory to move armies from.",
  };
}

function endTurn(state: RiskFullState): RiskFullState {
  // Hand off to CPU.
  return {
    ...state, selected: null, target: null, phase: "cpu",
    message: "Crimson Empire is taking its turn...",
    log: pushLog(state.log, "Your turn ended."),
  };
}

// Connectivity through friendly-owned territories — needed for classic fortify.
export function isConnectedFriendly(state: RiskFullState, a: number, b: number): boolean {
  if (a === b) return true;
  const visited = new Set<number>([a]);
  const stack = [a];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    for (const n of ADJ[cur]!) {
      if (visited.has(n)) continue;
      if (state.owner[n] !== state.owner[a]) continue;
      if (n === b) return true;
      visited.add(n);
      stack.push(n);
    }
  }
  return false;
}

// ───── CPU AI ───────────────────────────────────────────────────────────

function runCpuTurn(state: RiskFullState): RiskFullState {
  const rng = mulberry32(state.rngSeed);
  let armies = state.armies.slice();
  let owner = state.owner.slice();
  let cpuCards = state.cards.c.slice();
  let tradeIndex = state.tradeIndex;
  let log = state.log.slice();
  let conquered = false;

  const cpuOwned = (): number[] => owner.map((o, i) => ({ o, i })).filter(x => x.o === "c").map(x => x.i);
  const cpuBorders = (): number[] => cpuOwned().filter(i => ADJ[i]!.some(n => owner[n] === "p"));

  // 1) CARD TRADE — if hand ≥ 5 (forced) or 3 with high value
  if (cpuCards.length >= 5 || (cpuCards.length >= 3 && cardSetValue(tradeIndex) >= 8)) {
    const setIdx = findValidSet(cpuCards);
    if (setIdx) {
      const value = cardSetValue(tradeIndex);
      tradeIndex++;
      cpuCards = cpuCards.filter((_, idx) => !setIdx.includes(idx));
      // Auto-place these on the strongest CPU border to bolster.
      const borders = cpuBorders();
      const target = borders.length > 0
        ? borders.sort((a, b) => armies[b]! - armies[a]!)[0]!
        : cpuOwned().sort((a, b) => armies[b]! - armies[a]!)[0]!;
      if (target !== undefined) {
        armies[target] = armies[target]! + value;
        log = pushLog(log, `CPU traded a set: +${value} on ${TERRITORIES[target]!.name}`);
      }
    }
  }

  // 2) REINFORCE
  const cpuStateForBonus: RiskFullState = { ...state, armies, owner };
  let cpuReserve = reinforcementsFor(cpuStateForBonus, "c");
  while (cpuReserve > 0) {
    const borders = cpuBorders();
    const pool = borders.length > 0 ? borders : cpuOwned();
    if (pool.length === 0) break;
    // Score each candidate: prefer lowest-army borders adjacent to the strongest enemy.
    pool.sort((a, b) => {
      const enemyA = Math.max(0, ...ADJ[a]!.filter(n => owner[n] === "p").map(n => armies[n]!));
      const enemyB = Math.max(0, ...ADJ[b]!.filter(n => owner[n] === "p").map(n => armies[n]!));
      const deficitA = enemyA - armies[a]!;
      const deficitB = enemyB - armies[b]!;
      return deficitB - deficitA;
    });
    armies[pool[0]!] = armies[pool[0]!]! + 1;
    cpuReserve--;
  }
  log = pushLog(log, "CPU reinforces.");

  // 3) ATTACKS — greedy
  let attackRolls = 0;
  let conquests = 0;
  const MAX_ROLLS = 20;
  const MAX_CONQUESTS = 8;
  while (attackRolls < MAX_ROLLS && conquests < MAX_CONQUESTS) {
    type Pair = { att: number; def: number; advantage: number; bonus: number };
    const pairs: Pair[] = [];
    for (const i of cpuOwned()) {
      if (armies[i]! < 3) continue;  // need at least 3 to safely attack
      for (const n of ADJ[i]!) {
        if (owner[n] !== "p") continue;
        const adv = armies[i]! - 1 - armies[n]!;
        if (adv < 1) continue;
        let bonus = 0;
        const cont = TERRITORIES[n]!.cont;
        const contTerrs = TERRITORIES.map((t, k) => ({ t, k })).filter(x => x.t.cont === cont);
        const cpuInCont = contTerrs.filter(x => owner[x.k] === "c").length;
        if (cpuInCont >= contTerrs.length - 1) bonus = 3;   // completes continent
        else if (cpuInCont >= contTerrs.length - 2) bonus = 1;
        pairs.push({ att: i, def: n, advantage: adv, bonus });
      }
    }
    if (pairs.length === 0) break;
    pairs.sort((a, b) => (b.advantage + b.bonus * 2) - (a.advantage + a.bonus * 2));
    const pick = pairs[0]!;
    const attCount = Math.min(3, armies[pick.att]! - 1);
    const defCount = Math.min(2, armies[pick.def]!);
    const aDice = rollDice(rng, attCount);
    const dDice = rollDice(rng, defCount);
    let attLoss = 0, defLoss = 0;
    for (let i = 0; i < Math.min(aDice.length, dDice.length); i++) {
      if (aDice[i]! > dDice[i]!) defLoss += 1; else attLoss += 1;
    }
    armies[pick.att] = armies[pick.att]! - attLoss;
    armies[pick.def] = armies[pick.def]! - defLoss;
    attackRolls++;
    if (armies[pick.def]! <= 0) {
      // Conquer — move all but 1 in.
      const movers = Math.max(attCount, 1);
      // If player loses all territories, take their cards.
      owner[pick.def] = "c";
      armies[pick.def] = movers;
      armies[pick.att] = armies[pick.att]! - movers;
      if (armies[pick.att]! < 1) armies[pick.att] = 1;
      log = pushLog(log, `CPU conquered ${TERRITORIES[pick.def]!.name}!`);
      conquered = true;
      conquests++;
      const pAlive = owner.some(o => o === "p");
      if (!pAlive) {
        // Take their cards — XL rule "eliminate-and-take-cards"
        cpuCards = [...cpuCards, ...state.cards.p];
        log = pushLog(log, `CPU took all your cards (${state.cards.p.length}).`);
        break;
      }
    }
    if (armies[pick.att]! < 3) {
      // Not enough strength to keep attacking from this stack — continue the loop and pick a new pair next round.
      // (already handled by re-pairing each iteration)
    }
  }

  // 4) Draw a card if conquered
  if (conquered) {
    const owned = cpuOwned();
    if (owned.length > 0) {
      const terr = owned[Math.floor(rng() * owned.length)]!;
      cpuCards = [...cpuCards, drawCard(rng, terr)];
      log = pushLog(log, `CPU drew a card.`);
    }
  }

  // 5) FORTIFY — move an interior stack toward strongest border
  const interior = cpuOwned().filter(i => ADJ[i]!.every(n => owner[n] === "c") && armies[i]! >= 2);
  if (interior.length > 0) {
    interior.sort((a, b) => armies[b]! - armies[a]!);
    const src = interior[0]!;
    const borders = cpuBorders();
    if (borders.length > 0) {
      // BFS through friendly territories to find a border target.
      const target = bfsClosestFriendly(owner, src, borders);
      if (target !== null && target !== src) {
        const move = armies[src]! - 1;
        armies[src] = 1;
        armies[target] = armies[target]! + move;
        log = pushLog(log, `CPU fortified +${move} → ${TERRITORIES[target]!.name}`);
      }
    }
  }

  // 6) Hand off to the player.
  const nextSeed = Math.floor(rng() * 2 ** 31) >>> 0;
  const turn = state.turn + 1;
  const nextState: RiskFullState = {
    ...state,
    rngSeed: nextSeed,
    armies, owner,
    cards: { ...state.cards, c: cpuCards },
    tradeIndex,
    conqueredThisTurn: false,
    pendingConquest: null,
    selected: null, target: null,
    attackerDice: [], defenderDice: [], lastAttackLoss: null,
    turn,
    phase: "reinforce",
    log,
  };
  const w = checkWin(nextState);
  if (w === "c") return { ...nextState, phase: "done", message: "Crimson Empire rules the world. Defeat.", log: pushLog(nextState.log, "DEFEAT") };
  if (w === "p") return { ...nextState, phase: "done", message: "Total world domination — VICTORY!", log: pushLog(nextState.log, "VICTORY") };

  const ownedP = owner.filter(o => o === "p").length;
  if (ownedP === 0) {
    return { ...nextState, phase: "done", message: "Crimson Empire rules the world. Defeat.", log: pushLog(nextState.log, "DEFEAT") };
  }
  const reserve = reinforcementsFor(nextState, "p");
  return {
    ...nextState,
    reserve,
    message: `Turn ${turn} — Reinforce: place ${reserve} armies (incl. continent bonuses).`,
    log: pushLog(nextState.log, `Turn ${turn} — your reinforce.`),
  };
}

function bfsClosestFriendly(owner: Owner[], src: number, targets: number[]): number | null {
  if (targets.includes(src)) return src;
  const targetSet = new Set(targets);
  const visited = new Set<number>([src]);
  const queue: number[] = [src];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const n of ADJ[cur]!) {
      if (visited.has(n)) continue;
      if (owner[n] !== owner[src]) continue;
      visited.add(n);
      if (targetSet.has(n)) return n;
      queue.push(n);
    }
  }
  return null;
}

// ───── Scoring ──────────────────────────────────────────────────────────

export function score(s: RiskFullState): number {
  const pTerritories = s.owner.filter(o => o === "p").length;
  const pArmies = s.armies.reduce((acc, a, i) => acc + (s.owner[i] === "p" ? a : 0), 0);
  const win = s.message.startsWith("Total world domination") ? 2000 : 0;
  return Math.max(0, win + pTerritories * 25 + pArmies * 3);
}

export function isTerminal(s: RiskFullState): { score: number } | null {
  return s.phase === "done" ? { score: score(s) } : null;
}
