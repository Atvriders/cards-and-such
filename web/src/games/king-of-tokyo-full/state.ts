import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// --- Constants ---
export const STARTING_HP = 10;
export const MAX_HP = 10;
export const WIN_VP = 20;
export const DICE_COUNT = 6;
export const MAX_ROLLS = 3;
export const TOKYO_VP_BONUS = 2; // points for being in Tokyo at start of your turn
export const TOKYO_ENTRY_VP = 1; // points for entering Tokyo

export const MONSTER_NAMES = ["Gigazaur", "The King", "Cyber Bunny", "Meka Dragon"] as const;
export type MonsterName = typeof MONSTER_NAMES[number];

// All possible names players could pick from (per pitch). We use 4 by default
// matching player count, but extras are exposed for the howToPlay text.
export const ALL_MONSTER_NAMES = [
  "Gigazaur",
  "The King",
  "Cyber Bunny",
  "Meka Dragon",
  "Alienoid",
  "Kraken",
] as const;

export type Face = "1" | "2" | "3" | "claw" | "heart" | "energy";
export const FACES: Face[] = ["1", "2", "3", "claw", "heart", "energy"];

export interface KingOfTokyoFullSettings { _dummy: boolean; }

export interface PowerCard {
  id: string;
  name: string;
  cost: number;
  description: string;
  /** "discard" = single-use immediate, "keep" = persistent passive */
  kind: "discard" | "keep";
}

export const POWER_CARDS: PowerCard[] = [
  { id: "plot-twist", name: "Plot Twist", cost: 2, kind: "discard",
    description: "Reroll any one die (uses one of your rerolls this turn)." },
  { id: "healing-ray", name: "Healing Ray", cost: 3, kind: "discard",
    description: "Heal 2 HP immediately (cannot use while in Tokyo)." },
  { id: "detritivore", name: "Detritivore", cost: 4, kind: "keep",
    description: "Your Claw attacks deal +1 damage." },
  { id: "energy-hoarder", name: "Energy Hoarder", cost: 3, kind: "keep",
    description: "Gain 1 VP for each pair of Energy you hold at end of turn (advanced)." },
  { id: "extra-head", name: "Extra Head", cost: 5, kind: "keep",
    description: "Your Heart results heal +1 HP each." },
];

export interface Player {
  name: MonsterName;
  hp: number;
  vp: number;
  energy: number;
  isCpu: boolean;
  alive: boolean;
  cards: string[]; // ids of kept power cards
}

export type Phase =
  | "rolling"      // active player choosing dice / rerolling
  | "resolving"    // animation/intermediate (we use it as "show roll result" step)
  | "buyPhase"     // active player may buy a card
  | "yieldPrompt"  // tokyo occupant decides to yield after being hit
  | "gameOver";

export interface KingOfTokyoFullState {
  rngSeed: number;
  players: Player[];        // length 4: [you, cpu1, cpu2, cpu3]
  current: number;          // index of active player
  tokyo: number | null;     // index of player in Tokyo, or null
  dice: Face[];             // current 6 dice
  kept: boolean[];          // which dice are kept this turn (true = will NOT be rerolled)
  rollsUsed: number;        // 0..MAX_ROLLS
  phase: Phase;
  message: string;
  log: string[];            // recent action log lines (cap 20)
  turn: number;             // total turns played
  // For yield prompt:
  pendingAttacker: number | null;
  pendingDamage: number;
  // Result of last dice resolution (for display)
  lastResolution: {
    vpGained: number;
    energyGained: number;
    healed: number;
    damageDealt: number;
    targets: number[];
  } | null;
  winnerIndex: number | null;
}

export type KingOfTokyoFullAction =
  | { type: "toggleKeep"; index: number }
  | { type: "reroll" }
  | { type: "endRolling" }       // finish rolling early, resolve dice now
  | { type: "buy"; cardId: string }
  | { type: "skipBuy" }          // end turn without buying
  | { type: "yieldTokyo"; yield: boolean }
  | { type: "cpuStep" }          // drive CPU turns forward one step
  | { type: "reset" };

// --- Helpers ---
function rngFrom(seed: number): { rng: () => number; next: () => number } {
  const rng = mulberry32(seed);
  return { rng, next: () => Math.floor(rng() * 2 ** 31) };
}

function rollDie(rng: () => number): Face {
  return FACES[Math.floor(rng() * FACES.length)] as Face;
}

function pushLog(state: KingOfTokyoFullState, line: string): string[] {
  const log = [...state.log, line];
  while (log.length > 30) log.shift();
  return log;
}

function aliveCount(players: Player[]): number {
  return players.filter((p) => p.alive).length;
}

function nextAliveIndex(players: Player[], from: number): number {
  const n = players.length;
  for (let i = 1; i <= n; i++) {
    const idx = (from + i) % n;
    if (players[idx]?.alive) return idx;
  }
  return from;
}

// --- Initial state ---
export function initialState(seed: number, _settings: KingOfTokyoFullSettings): KingOfTokyoFullState {
  const { rng, next } = rngFrom(seed);
  const players: Player[] = MONSTER_NAMES.map((n, i) => ({
    name: n,
    hp: STARTING_HP,
    vp: 0,
    energy: 0,
    isCpu: i !== 0,
    alive: true,
    cards: [],
  }));
  // Roll initial dice for player 0
  const dice: Face[] = [];
  for (let i = 0; i < DICE_COUNT; i++) dice.push(rollDie(rng));
  return {
    rngSeed: next(),
    players,
    current: 0,
    tokyo: null,
    dice,
    kept: new Array(DICE_COUNT).fill(false),
    rollsUsed: 1,
    phase: "rolling",
    message: "Roll the dice or reroll any you don't want.",
    log: [`${players[0]!.name}'s turn.`],
    turn: 1,
    pendingAttacker: null,
    pendingDamage: 0,
    lastResolution: null,
    winnerIndex: null,
  };
}

// --- Start of turn: award Tokyo VP if applicable ---
function applyStartOfTurn(state: KingOfTokyoFullState): KingOfTokyoFullState {
  let s = state;
  if (s.tokyo === s.current && s.players[s.current]?.alive) {
    const ps = s.players.map((p, i) => i === s.current ? { ...p, vp: p.vp + TOKYO_VP_BONUS } : p);
    s = { ...s, players: ps, log: pushLog(s, `${s.players[s.current]!.name} starts turn in Tokyo +${TOKYO_VP_BONUS} VP.`) };
  }
  // Check immediate win
  if ((s.players[s.current]?.vp ?? 0) >= WIN_VP) {
    return { ...s, phase: "gameOver", winnerIndex: s.current, message: `${s.players[s.current]!.name} wins with ${s.players[s.current]!.vp} VP!` };
  }
  return s;
}

// --- Start a player's roll: fresh dice ---
function startRollingFor(state: KingOfTokyoFullState, playerIndex: number): KingOfTokyoFullState {
  const { rng, next } = rngFrom(state.rngSeed);
  const dice: Face[] = [];
  for (let i = 0; i < DICE_COUNT; i++) dice.push(rollDie(rng));
  return {
    ...state,
    rngSeed: next(),
    current: playerIndex,
    dice,
    kept: new Array(DICE_COUNT).fill(false),
    rollsUsed: 1,
    phase: "rolling",
    pendingAttacker: null,
    pendingDamage: 0,
    lastResolution: null,
    message: state.players[playerIndex]!.isCpu
      ? `${state.players[playerIndex]!.name} (CPU) is thinking...`
      : "Roll the dice or reroll any you don't want.",
  };
}

// --- Reroll non-kept dice ---
function doReroll(state: KingOfTokyoFullState): KingOfTokyoFullState {
  if (state.rollsUsed >= MAX_ROLLS) return state;
  const { rng, next } = rngFrom(state.rngSeed);
  const dice = state.dice.map((d, i) => state.kept[i] ? d : rollDie(rng));
  return { ...state, rngSeed: next(), dice, rollsUsed: state.rollsUsed + 1 };
}

// --- Resolve dice ---
function resolveDice(state: KingOfTokyoFullState): KingOfTokyoFullState {
  const counts: Record<Face, number> = { "1": 0, "2": 0, "3": 0, claw: 0, heart: 0, energy: 0 };
  for (const d of state.dice) counts[d] += 1;

  let vp = 0;
  for (const n of ["1", "2", "3"] as Face[]) {
    const c = counts[n];
    const base = Number(n);
    if (c >= 3) {
      vp += base;
      vp += c - 3; // bonus +1 each extra
    }
  }

  const attacker = state.players[state.current]!;
  const detritivore = attacker.cards.includes("detritivore") ? 1 : 0;
  const extraHead = attacker.cards.includes("extra-head") ? 1 : 0;

  const damagePerClaw = 1 + detritivore;
  const damageDealt = counts.claw * damagePerClaw;
  const heartHeal = counts.heart * (1 + extraHead);
  const energyGained = counts.energy;

  const inTokyo = state.tokyo === state.current;

  // Compute target indices
  let targets: number[];
  if (inTokyo) {
    targets = state.players.map((_, i) => i).filter((i) => i !== state.current && state.players[i]!.alive);
  } else {
    targets = state.tokyo !== null && state.players[state.tokyo]!.alive ? [state.tokyo] : [];
  }

  // Apply effects
  const newPlayers = state.players.map((p) => ({ ...p }));
  // Energy
  newPlayers[state.current]!.energy += energyGained;
  // Heart (cannot heal in Tokyo)
  if (!inTokyo && heartHeal > 0) {
    newPlayers[state.current]!.hp = Math.min(MAX_HP, newPlayers[state.current]!.hp + heartHeal);
  }
  // VP
  newPlayers[state.current]!.vp += vp;
  // Damage targets
  for (const ti of targets) {
    const tp = newPlayers[ti]!;
    tp.hp = Math.max(0, tp.hp - damageDealt);
    if (tp.hp <= 0) tp.alive = false;
  }

  // Build log
  const aname = attacker.name;
  const parts: string[] = [];
  if (vp > 0) parts.push(`+${vp} VP`);
  if (energyGained > 0) parts.push(`+${energyGained} energy`);
  if (heartHeal > 0 && !inTokyo) parts.push(`heal ${heartHeal}`);
  if (damageDealt > 0 && targets.length > 0) parts.push(`${damageDealt} dmg to ${targets.length} foe(s)`);
  const line = parts.length === 0 ? `${aname} rolled nothing useful.` : `${aname}: ${parts.join(", ")}.`;
  let log = pushLog({ ...state, log: state.log }, line);

  // If tokyo was empty and attacker attacked anyone (no targets but attacked? need to check claws)
  let tokyo = state.tokyo;
  if (tokyo === null && counts.claw > 0 && !inTokyo) {
    tokyo = state.current;
    newPlayers[state.current]!.vp += TOKYO_ENTRY_VP;
    log = pushLog({ ...state, log }, `${aname} enters Tokyo (+${TOKYO_ENTRY_VP} VP).`);
  }

  // Check terminal conditions BEFORE yield prompt
  // Death check
  // Update tokyo if occupant died
  if (tokyo !== null && !newPlayers[tokyo]!.alive) {
    tokyo = null;
  }

  // Check winner: 20 VP or last standing
  const aliveIdxs = newPlayers.map((p, i) => p.alive ? i : -1).filter((i) => i >= 0);
  const vpWinner = newPlayers.findIndex((p) => p.vp >= WIN_VP && p.alive);
  if (vpWinner >= 0) {
    return {
      ...state,
      players: newPlayers,
      tokyo,
      lastResolution: { vpGained: vp, energyGained, healed: !inTokyo ? heartHeal : 0, damageDealt, targets },
      phase: "gameOver",
      winnerIndex: vpWinner,
      message: `${newPlayers[vpWinner]!.name} wins with ${newPlayers[vpWinner]!.vp} VP!`,
      log,
    };
  }
  if (aliveIdxs.length <= 1) {
    const w = aliveIdxs[0] ?? state.current;
    return {
      ...state,
      players: newPlayers,
      tokyo,
      lastResolution: { vpGained: vp, energyGained, healed: !inTokyo ? heartHeal : 0, damageDealt, targets },
      phase: "gameOver",
      winnerIndex: w,
      message: `${newPlayers[w]!.name} is the last monster standing!`,
      log,
    };
  }

  // Yield prompt: if attacker attacked Tokyo occupant (i.e. not in Tokyo and tokyo has occupant) and that occupant is alive
  if (!inTokyo && state.tokyo !== null && newPlayers[state.tokyo]!.alive && damageDealt > 0) {
    const occupant = state.tokyo;
    return {
      ...state,
      players: newPlayers,
      tokyo,
      lastResolution: { vpGained: vp, energyGained, healed: !inTokyo ? heartHeal : 0, damageDealt, targets },
      phase: "yieldPrompt",
      pendingAttacker: state.current,
      pendingDamage: damageDealt,
      message: `${newPlayers[occupant]!.name} took ${damageDealt} damage in Tokyo. Yield to ${aname}?`,
      log,
    };
  }

  // Otherwise proceed to buy phase
  return {
    ...state,
    players: newPlayers,
    tokyo,
    lastResolution: { vpGained: vp, energyGained, healed: !inTokyo ? heartHeal : 0, damageDealt, targets },
    phase: "buyPhase",
    message: `${aname} may buy a power card or end turn.`,
    log,
  };
}

// --- Advance to next player ---
function advanceTurn(state: KingOfTokyoFullState): KingOfTokyoFullState {
  if (state.phase === "gameOver") return state;
  const nextIdx = nextAliveIndex(state.players, state.current);
  if (nextIdx === state.current && aliveCount(state.players) === 1) {
    return { ...state, phase: "gameOver", winnerIndex: state.current, message: `${state.players[state.current]!.name} wins!` };
  }
  let s = { ...state, current: nextIdx, turn: state.turn + 1, log: pushLog(state, `${state.players[nextIdx]!.name}'s turn.`) };
  s = applyStartOfTurn(s);
  if (s.phase === "gameOver") return s;
  return startRollingFor(s, nextIdx);
}

// --- CPU AI ---
function cpuPickKeeps(dice: Face[], player: Player, rollsLeft: number): boolean[] {
  const keep: boolean[] = dice.map(() => false);
  if (rollsLeft <= 0) return keep;
  const counts: Record<Face, number> = { "1": 0, "2": 0, "3": 0, claw: 0, heart: 0, energy: 0 };
  for (const d of dice) counts[d]++;

  // Always keep claws if low HP (defensive aggression scales)
  // Keep number faces that are pairs/triples
  // Keep hearts if HP < 7 and not in Tokyo
  for (let i = 0; i < dice.length; i++) {
    const d = dice[i]!;
    if (d === "claw") keep[i] = true;
    else if (d === "energy") keep[i] = true;
    else if (d === "heart") keep[i] = player.hp < 7;
    else {
      // number face: keep if we already have 2+ of that number
      if (counts[d] >= 2) keep[i] = true;
    }
  }
  return keep;
}

function cpuBuyDecision(player: Player): string | null {
  // Greedy: buy cheapest affordable card we don't already own
  const affordable = POWER_CARDS
    .filter((c) => c.cost <= player.energy && (c.kind === "discard" || !player.cards.includes(c.id)))
    .sort((a, b) => a.cost - b.cost);
  return affordable[0]?.id ?? null;
}

function cpuYieldDecision(occupant: Player): boolean {
  // Yield if HP would be dangerous (<=3) — to live to fight another day
  return occupant.hp <= 3;
}

// --- Reducer ---
export function reducer(state: KingOfTokyoFullState, action: KingOfTokyoFullAction): KingOfTokyoFullState {
  if (action.type === "reset") {
    return initialState(state.rngSeed ^ 0x9e3779b9, { _dummy: false });
  }

  if (state.phase === "gameOver") return state;

  if (action.type === "toggleKeep") {
    if (state.phase !== "rolling") return state;
    if (state.players[state.current]?.isCpu) return state; // CPU drives itself
    if (action.index < 0 || action.index >= state.dice.length) return state;
    const kept = state.kept.slice();
    kept[action.index] = !kept[action.index];
    return { ...state, kept };
  }

  if (action.type === "reroll") {
    if (state.phase !== "rolling") return state;
    if (state.rollsUsed >= MAX_ROLLS) return state;
    if (state.players[state.current]?.isCpu) return state;
    return doReroll(state);
  }

  if (action.type === "endRolling") {
    if (state.phase !== "rolling") return state;
    return resolveDice(state);
  }

  if (action.type === "buy") {
    if (state.phase !== "buyPhase") return state;
    if (state.players[state.current]?.isCpu) return state;
    const card = POWER_CARDS.find((c) => c.id === action.cardId);
    if (!card) return state;
    const me = state.players[state.current]!;
    if (me.energy < card.cost) return state;
    const newPlayers = state.players.map((p) => ({ ...p, cards: [...p.cards] }));
    newPlayers[state.current]!.energy -= card.cost;
    let log = pushLog(state, `${me.name} buys ${card.name} for ${card.cost}E.`);

    if (card.kind === "keep") {
      if (!newPlayers[state.current]!.cards.includes(card.id)) {
        newPlayers[state.current]!.cards.push(card.id);
      }
    } else {
      // discard cards: apply immediate effect
      if (card.id === "healing-ray") {
        if (state.tokyo !== state.current) {
          newPlayers[state.current]!.hp = Math.min(MAX_HP, newPlayers[state.current]!.hp + 2);
          log = pushLog({ ...state, log }, `${me.name} heals 2 HP.`);
        } else {
          // refund: cannot heal in tokyo, refund cost
          newPlayers[state.current]!.energy += card.cost;
          log = pushLog({ ...state, log }, `${me.name} cannot heal in Tokyo (refunded).`);
        }
      }
      // plot-twist: in this simple impl, we treat plot-twist as buyPhase-only; documented as advanced.
      // Detritivore/Extra Head already covered by "keep" branch.
    }
    return { ...state, players: newPlayers, log };
  }

  if (action.type === "skipBuy") {
    if (state.phase !== "buyPhase") return state;
    if (state.players[state.current]?.isCpu) return state;
    return advanceTurn(state);
  }

  if (action.type === "yieldTokyo") {
    if (state.phase !== "yieldPrompt") return state;
    if (state.tokyo === null || state.pendingAttacker === null) return state;
    const occupantIdx = state.tokyo;
    const occupant = state.players[occupantIdx]!;
    if (occupant.isCpu) return state; // CPU drives itself
    let newPlayers = state.players.map((p) => ({ ...p }));
    let newTokyo = state.tokyo as number | null;
    let log = state.log;
    if (action.yield) {
      newTokyo = state.pendingAttacker;
      newPlayers[state.pendingAttacker]!.vp += TOKYO_ENTRY_VP;
      log = pushLog(state, `${occupant.name} yields Tokyo to ${newPlayers[state.pendingAttacker]!.name} (+${TOKYO_ENTRY_VP} VP).`);
    } else {
      log = pushLog(state, `${occupant.name} stays in Tokyo.`);
    }
    let s: KingOfTokyoFullState = {
      ...state,
      players: newPlayers,
      tokyo: newTokyo,
      pendingAttacker: null,
      pendingDamage: 0,
      log,
      phase: "buyPhase",
      message: `${state.players[state.current]!.name} may buy a power card or end turn.`,
    };
    // Check VP win after yield reward
    const winner = s.players.findIndex((p) => p.vp >= WIN_VP && p.alive);
    if (winner >= 0) {
      s = { ...s, phase: "gameOver", winnerIndex: winner, message: `${s.players[winner]!.name} wins with ${s.players[winner]!.vp} VP!` };
    }
    return s;
  }

  if (action.type === "cpuStep") {
    return cpuStep(state);
  }

  return state;
}

// --- CPU step driver: advances the CPU's state by one logical action ---
function cpuStep(state: KingOfTokyoFullState): KingOfTokyoFullState {
  if (state.phase === "gameOver") return state;
  const cur = state.players[state.current];
  // Handle yield prompt regardless of whose turn it is (occupant may be CPU)
  if (state.phase === "yieldPrompt") {
    if (state.tokyo === null) return state;
    const occupantIdx = state.tokyo;
    const occupant = state.players[occupantIdx]!;
    if (!occupant.isCpu) return state;
    const wantYield = cpuYieldDecision(occupant);
    const newPlayers = state.players.map((p) => ({ ...p }));
    let newTokyo = state.tokyo as number | null;
    let log = state.log;
    if (wantYield && state.pendingAttacker !== null) {
      newTokyo = state.pendingAttacker;
      newPlayers[state.pendingAttacker]!.vp += TOKYO_ENTRY_VP;
      log = pushLog(state, `${occupant.name} yields Tokyo to ${newPlayers[state.pendingAttacker]!.name} (+${TOKYO_ENTRY_VP} VP).`);
    } else {
      log = pushLog(state, `${occupant.name} stays in Tokyo.`);
    }
    let s: KingOfTokyoFullState = {
      ...state,
      players: newPlayers,
      tokyo: newTokyo,
      pendingAttacker: null,
      pendingDamage: 0,
      log,
      phase: "buyPhase",
      message: `${state.players[state.current]!.name} may buy a power card or end turn.`,
    };
    const winner = s.players.findIndex((p) => p.vp >= WIN_VP && p.alive);
    if (winner >= 0) {
      s = { ...s, phase: "gameOver", winnerIndex: winner, message: `${s.players[winner]!.name} wins with ${s.players[winner]!.vp} VP!` };
    }
    return s;
  }
  if (!cur || !cur.isCpu) return state;
  if (state.phase === "rolling") {
    if (state.rollsUsed < MAX_ROLLS) {
      // Decide which to keep, then reroll
      const keep = cpuPickKeeps(state.dice, cur, MAX_ROLLS - state.rollsUsed);
      const allKept = keep.every((k) => k);
      if (allKept) {
        return resolveDice({ ...state, kept: keep });
      }
      return doReroll({ ...state, kept: keep });
    } else {
      return resolveDice(state);
    }
  }
  if (state.phase === "buyPhase") {
    const buyId = cpuBuyDecision(cur);
    if (buyId) {
      // Apply the buy via the buy path inline (CPU)
      const card = POWER_CARDS.find((c) => c.id === buyId)!;
      const newPlayers = state.players.map((p) => ({ ...p, cards: [...p.cards] }));
      newPlayers[state.current]!.energy -= card.cost;
      let log = pushLog(state, `${cur.name} buys ${card.name} for ${card.cost}E.`);
      if (card.kind === "keep") {
        if (!newPlayers[state.current]!.cards.includes(card.id)) {
          newPlayers[state.current]!.cards.push(card.id);
        }
      } else if (card.id === "healing-ray") {
        if (state.tokyo !== state.current) {
          newPlayers[state.current]!.hp = Math.min(MAX_HP, newPlayers[state.current]!.hp + 2);
          log = pushLog({ ...state, log }, `${cur.name} heals 2 HP.`);
        } else {
          newPlayers[state.current]!.energy += card.cost;
          log = pushLog({ ...state, log }, `${cur.name} cannot heal in Tokyo (refunded).`);
        }
      }
      return { ...state, players: newPlayers, log };
    }
    return advanceTurn(state);
  }
  return state;
}

// --- isTerminal ---
export function isTerminal(state: KingOfTokyoFullState): { score: number } | null {
  if (state.phase !== "gameOver") return null;
  // Player 0 is the human. Win => their VP; loss => 0 (off leaderboard).
  if (state.winnerIndex === 0) return { score: state.players[0]?.vp ?? 0 };
  return { score: 0 };
}
