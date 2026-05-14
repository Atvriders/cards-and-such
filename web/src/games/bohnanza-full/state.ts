import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Bohnanza-full: 4-player bean-farming + trading card game.
// 11 bean varieties, each present with a fixed count in the deck.
// Coin tables convert harvested fields into coins (= victory points).
// Game ends after the deck has been reshuffled and run out 3 times.

export type BeanKind =
  | "coffee"
  | "wax"
  | "blue"
  | "chili"
  | "stink"
  | "green"
  | "soy"
  | "blackeyed"
  | "red"
  | "garden"
  | "cocoa";

export const BEAN_ORDER: readonly BeanKind[] = [
  "coffee",
  "wax",
  "blue",
  "chili",
  "stink",
  "green",
  "soy",
  "blackeyed",
  "red",
  "garden",
  "cocoa",
];

export interface BeanInfo {
  name: string;
  count: number;
  // coin thresholds: cards-needed-for-1/2/3/4-coins
  coinTable: readonly [number, number, number, number];
  color: string;
}

export const BEANS: Record<BeanKind, BeanInfo> = {
  coffee: { name: "Coffee", count: 24, coinTable: [4, 7, 10, 12], color: "#3a2418" },
  wax: { name: "Wax", count: 22, coinTable: [4, 7, 9, 11], color: "#d6c265" },
  blue: { name: "Blue", count: 20, coinTable: [4, 6, 8, 10], color: "#2b67a6" },
  chili: { name: "Chili", count: 18, coinTable: [3, 6, 8, 9], color: "#b53121" },
  stink: { name: "Stink", count: 16, coinTable: [3, 5, 7, 8], color: "#5b4a2b" },
  green: { name: "Green", count: 14, coinTable: [3, 5, 6, 7], color: "#2f7a3b" },
  soy: { name: "Soy", count: 12, coinTable: [2, 4, 6, 7], color: "#a8c466" },
  blackeyed: { name: "Black-Eyed", count: 10, coinTable: [2, 4, 5, 6], color: "#1a1a1a" },
  red: { name: "Red", count: 8, coinTable: [2, 3, 4, 5], color: "#c93b3b" },
  garden: { name: "Garden", count: 6, coinTable: [2, 3, 0, 0], color: "#9b59b6" },
  cocoa: { name: "Cocoa", count: 4, coinTable: [2, 3, 4, 0], color: "#6b3a1f" },
};

export const NUM_PLAYERS = 4;
export const NUM_FIELDS = 2;
export const HAND_SIZE_START = 5;
export const TRADE_DRAW = 2;
export const TURN_END_DRAW = 3;
export const DECK_CYCLES_TO_END = 3;

export type Phase =
  | "plantFirst" // must plant card[0]
  | "plantSecondOptional" // may plant card[0] again or skip
  | "tradePhase" // 2 revealed cards being auto-traded / accepted
  | "plantRevealed" // plant any remaining revealed cards
  | "drawEnd" // draw 3 to hand back
  | "cpuTurn" // a CPU is executing its full turn (resolved synchronously by reducer)
  | "done";

export interface Field {
  bean: BeanKind | null;
  count: number;
}

export interface Player {
  id: number;
  isCpu: boolean;
  hand: BeanKind[]; // front of hand = index 0 (next to play)
  fields: Field[];
  coins: number;
}

export interface BohnanzaState {
  rngSeed: number;
  players: Player[];
  deck: BeanKind[];
  discard: BeanKind[];
  deckCyclesUsed: number; // increments when deck runs out
  revealed: BeanKind[]; // 2 cards flipped during trade phase
  current: number; // current player index
  phase: Phase;
  message: string;
  // Pending field-choice for human:
  pendingPlant: BeanKind | null;
  // Action ledger (recent events) for UI
  log: string[];
}

export type BohnanzaAction =
  | { type: "plantFirst" } // plant top hand card into the field decided automatically (or via plantInto)
  | { type: "plantInto"; fieldIndex: number } // human chooses which field to plant pendingPlant into
  | { type: "skipSecondPlant" }
  | { type: "harvestField"; fieldIndex: number } // sell a field for coins
  | { type: "endTurn" } // begin trade reveal -> auto-trade -> draw 3 -> advance
  | { type: "plantRevealedInto"; fieldIndex: number } // pendingPlant from revealed card
  | { type: "skipRevealedPlant" }
  | { type: "cpuStep" }; // execute next CPU turn

// ---------- helpers ----------

function shuffleDeck(seed: number): { deck: BeanKind[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const cards: BeanKind[] = [];
  for (const k of BEAN_ORDER) {
    const info = BEANS[k];
    for (let i = 0; i < info.count; i++) cards.push(k);
  }
  // Fisher-Yates
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = cards[i]!;
    const b = cards[j]!;
    cards[i] = b;
    cards[j] = a;
  }
  return { deck: cards, nextSeed: Math.floor(rng() * 2 ** 31) };
}

export function coinsForField(bean: BeanKind, count: number): number {
  const table = BEANS[bean].coinTable;
  let coins = 0;
  for (let i = 3; i >= 0; i--) {
    const need = table[i]!;
    if (need > 0 && count >= need) {
      coins = i + 1;
      break;
    }
  }
  return coins;
}

function drawFromDeck(
  deck: BeanKind[],
  discard: BeanKind[],
  cyclesUsed: number,
  seed: number,
  n: number
): { drawn: BeanKind[]; deck: BeanKind[]; discard: BeanKind[]; cyclesUsed: number; nextSeed: number } {
  const drawn: BeanKind[] = [];
  let d = deck.slice();
  let disc = discard.slice();
  let cu = cyclesUsed;
  let s = seed;
  for (let i = 0; i < n; i++) {
    if (d.length === 0) {
      // reshuffle discard
      if (disc.length === 0) break;
      cu += 1;
      if (cu >= DECK_CYCLES_TO_END) {
        // game-end signaled outside; stop drawing
        break;
      }
      const rng = mulberry32(s);
      const arr = disc.slice();
      for (let k = arr.length - 1; k > 0; k--) {
        const j = Math.floor(rng() * (k + 1));
        const a = arr[k]!;
        const b = arr[j]!;
        arr[k] = b;
        arr[j] = a;
      }
      d = arr;
      disc = [];
      s = Math.floor(rng() * 2 ** 31);
    }
    const top = d.shift();
    if (top !== undefined) drawn.push(top);
  }
  return { drawn, deck: d, discard: disc, cyclesUsed: cu, nextSeed: s };
}

export function isTerminal(s: BohnanzaState): { score: number } | null {
  if (s.phase !== "done") return null;
  // Score = human player's coins. Add bonus if they have the highest coin count.
  const me = s.players[0]!;
  const max = Math.max(...s.players.map((p) => p.coins));
  const winners = s.players.filter((p) => p.coins === max).length;
  let score = me.coins;
  if (me.coins === max && winners === 1) score += 5;
  return { score: Math.max(0, score) };
}

// ---------- planting / harvesting logic ----------

function findFieldFor(player: Player, bean: BeanKind): number {
  // returns field index that already has this bean, or first empty field, or -1
  for (let i = 0; i < player.fields.length; i++) {
    if (player.fields[i]!.bean === bean) return i;
  }
  for (let i = 0; i < player.fields.length; i++) {
    if (player.fields[i]!.bean === null) return i;
  }
  return -1;
}

function smallestNonEmptyField(player: Player): number {
  let best = -1;
  let bestCount = Infinity;
  for (let i = 0; i < player.fields.length; i++) {
    const f = player.fields[i]!;
    if (f.bean !== null && f.count > 0 && f.count < bestCount) {
      bestCount = f.count;
      best = i;
    }
  }
  return best;
}

function harvestFieldInPlayer(
  players: Player[],
  pIdx: number,
  fIdx: number,
  options?: { forced?: boolean }
): { players: Player[]; coinsGained: number; discarded: BeanKind[]; harvestedBean: BeanKind | null } {
  const p = players[pIdx]!;
  const f = p.fields[fIdx]!;
  if (f.bean === null || f.count === 0) {
    return { players, coinsGained: 0, discarded: [], harvestedBean: null };
  }
  // Standard Bohnanza rule: voluntary harvest of a 1-card field is only
  // allowed if every other (non-empty) field is also a single. Forced
  // harvests during planting bypass this rule (you can always make room).
  const forced = options?.forced === true;
  if (!forced) {
    const allSingles = p.fields.every((ff) => (ff.bean === null ? true : ff.count <= 1));
    if (f.count < 2 && !allSingles) {
      return { players, coinsGained: 0, discarded: [], harvestedBean: null };
    }
  }
  const coins = coinsForField(f.bean, f.count);
  const cardsKept = coins; // those go to coin pile
  const cardsDiscarded = f.count - cardsKept;
  const discarded: BeanKind[] = [];
  for (let i = 0; i < cardsDiscarded; i++) discarded.push(f.bean);
  const newPlayers = players.slice();
  const newFields = p.fields.slice();
  newFields[fIdx] = { bean: null, count: 0 };
  newPlayers[pIdx] = { ...p, fields: newFields, coins: p.coins + coins };
  return { players: newPlayers, coinsGained: coins, discarded, harvestedBean: f.bean };
}

function plantBean(
  players: Player[],
  pIdx: number,
  bean: BeanKind,
  fieldIdx: number | null
): { players: Player[]; discarded: BeanKind[]; coinsGained: number; planted: boolean } {
  // returns updated players; if planting requires harvesting first (different bean in chosen field),
  // we harvest first and then plant.
  const p = players[pIdx]!;
  let target = fieldIdx;
  if (target === null) target = findFieldFor(p, bean);
  if (target === -1 || target === null) {
    // No room — discard the bean (shouldn't happen in normal mandatory plant since we always have room
    // by harvesting smallest)
    return { players, discarded: [bean], coinsGained: 0, planted: false };
  }
  let workingPlayers = players;
  let workingP = p;
  let coinsGained = 0;
  const discarded: BeanKind[] = [];
  const targetField = workingP.fields[target]!;
  if (targetField.bean !== null && targetField.bean !== bean) {
    // Harvest first (forced harvest bypasses the 1-card rule)
    const h = harvestFieldInPlayer(workingPlayers, pIdx, target, { forced: true });
    if (h.harvestedBean === null) {
      // can't harvest -> can't plant -> discard the bean
      return { players: workingPlayers, discarded: [bean], coinsGained: 0, planted: false };
    }
    workingPlayers = h.players;
    workingP = workingPlayers[pIdx]!;
    coinsGained += h.coinsGained;
    discarded.push(...h.discarded);
  }
  const newFields = workingP.fields.slice();
  const cur = newFields[target]!;
  newFields[target] = { bean, count: (cur.bean === bean ? cur.count : 0) + 1 };
  workingPlayers = workingPlayers.slice();
  workingPlayers[pIdx] = { ...workingP, fields: newFields };
  return { players: workingPlayers, discarded, coinsGained, planted: true };
}

// ---------- initial state ----------

export interface BohnanzaSettings { _dummy: boolean; }

export function initialState(seed: number, _settings: BohnanzaSettings): BohnanzaState {
  const sh = shuffleDeck(seed);
  let deck = sh.deck;
  const players: Player[] = [];
  for (let i = 0; i < NUM_PLAYERS; i++) {
    const hand: BeanKind[] = [];
    for (let h = 0; h < HAND_SIZE_START; h++) {
      const top = deck[0];
      if (top !== undefined) {
        hand.push(top);
        deck = deck.slice(1);
      }
    }
    players.push({
      id: i,
      isCpu: i !== 0,
      hand,
      fields: Array.from({ length: NUM_FIELDS }, () => ({ bean: null as BeanKind | null, count: 0 })),
      coins: 0,
    });
  }
  return {
    rngSeed: sh.nextSeed,
    players,
    deck,
    discard: [],
    deckCyclesUsed: 0,
    revealed: [],
    current: 0,
    phase: "plantFirst",
    message: "Plant the first card from your hand.",
    pendingPlant: null,
    log: [`Game start - deck has ${deck.length} cards.`],
  };
}

// ---------- CPU logic ----------

function cpuChooseField(player: Player, bean: BeanKind): number {
  // 1. existing matching field
  // 2. empty field
  // 3. smallest non-matching field (forces harvest)
  for (let i = 0; i < player.fields.length; i++) {
    if (player.fields[i]!.bean === bean) return i;
  }
  for (let i = 0; i < player.fields.length; i++) {
    if (player.fields[i]!.bean === null) return i;
  }
  // forced harvest -> pick field with the lowest count
  let best = 0;
  let bestCount = Infinity;
  for (let i = 0; i < player.fields.length; i++) {
    const f = player.fields[i]!;
    if (f.count < bestCount) {
      bestCount = f.count;
      best = i;
    }
  }
  return best;
}

function cpuShouldPlantSecond(player: Player): boolean {
  // Plant second if the next card in hand matches an existing field or there's an empty field.
  const next = player.hand[0];
  if (!next) return false;
  for (let i = 0; i < player.fields.length; i++) {
    const f = player.fields[i]!;
    if (f.bean === next || f.bean === null) return true;
  }
  return false;
}

function runCpuTurn(state: BohnanzaState, pIdx: number): BohnanzaState {
  let players = state.players;
  let deck = state.deck;
  let discard = state.discard;
  let cyclesUsed = state.deckCyclesUsed;
  let seed = state.rngSeed;
  const log: string[] = [];
  const name = `P${pIdx + 1}`;

  // Plant first (mandatory)
  let p = players[pIdx]!;
  if (p.hand.length > 0) {
    const card = p.hand[0]!;
    const fIdx = cpuChooseField(p, card);
    const plant = plantBean(players, pIdx, card, fIdx);
    players = plant.players;
    if (plant.discarded.length > 0) discard = discard.concat(plant.discarded);
    const np = players[pIdx]!;
    players = players.slice();
    players[pIdx] = { ...np, hand: np.hand.slice(1) };
    log.push(`${name} planted ${BEANS[card].name}.`);
  }

  // Optionally plant second
  p = players[pIdx]!;
  if (cpuShouldPlantSecond(p) && p.hand.length > 0) {
    const card = p.hand[0]!;
    const fIdx = cpuChooseField(p, card);
    const plant = plantBean(players, pIdx, card, fIdx);
    players = plant.players;
    if (plant.discarded.length > 0) discard = discard.concat(plant.discarded);
    const np = players[pIdx]!;
    players = players.slice();
    players[pIdx] = { ...np, hand: np.hand.slice(1) };
    log.push(`${name} planted ${BEANS[card].name} (2nd).`);
  }

  // Trade phase: flip 2, auto-plant for CPU
  const reveal = drawFromDeck(deck, discard, cyclesUsed, seed, TRADE_DRAW);
  deck = reveal.deck;
  discard = reveal.discard;
  cyclesUsed = reveal.cyclesUsed;
  seed = reveal.nextSeed;
  for (const card of reveal.drawn) {
    const cp = players[pIdx]!;
    const fIdx = cpuChooseField(cp, card);
    const plant = plantBean(players, pIdx, card, fIdx);
    players = plant.players;
    if (plant.discarded.length > 0) discard = discard.concat(plant.discarded);
    log.push(`${name} revealed and planted ${BEANS[card].name}.`);
  }

  // Draw 3 to back of hand
  const draw = drawFromDeck(deck, discard, cyclesUsed, seed, TURN_END_DRAW);
  deck = draw.deck;
  discard = draw.discard;
  cyclesUsed = draw.cyclesUsed;
  seed = draw.nextSeed;
  const cp = players[pIdx]!;
  players = players.slice();
  players[pIdx] = { ...cp, hand: cp.hand.concat(draw.drawn) };

  if (cyclesUsed >= DECK_CYCLES_TO_END) {
    // game end: final harvest of every player's fields
    players = finalHarvest(players);
    return {
      ...state,
      players,
      deck,
      discard,
      deckCyclesUsed: cyclesUsed,
      rngSeed: seed,
      revealed: [],
      pendingPlant: null,
      phase: "done",
      message: "Game over.",
      log: state.log.concat(log).concat(["Deck cycled 3 times. Final score."]),
    };
  }

  return {
    ...state,
    players,
    deck,
    discard,
    deckCyclesUsed: cyclesUsed,
    rngSeed: seed,
    revealed: [],
    pendingPlant: null,
    current: (pIdx + 1) % NUM_PLAYERS,
    phase: players[(pIdx + 1) % NUM_PLAYERS]!.isCpu ? "cpuTurn" : "plantFirst",
    message: players[(pIdx + 1) % NUM_PLAYERS]!.isCpu
      ? `P${((pIdx + 1) % NUM_PLAYERS) + 1} is thinking...`
      : "Your turn. Plant the first card from your hand.",
    log: state.log.concat(log),
  };
}

function finalHarvest(players: Player[]): Player[] {
  return players.map((p) => {
    let coins = p.coins;
    const newFields = p.fields.map((f) => {
      if (f.bean !== null && f.count > 0) {
        coins += coinsForField(f.bean, f.count);
        return { bean: null as BeanKind | null, count: 0 };
      }
      return f;
    });
    return { ...p, coins, fields: newFields };
  });
}

// ---------- reducer ----------

export function reducer(state: BohnanzaState, action: BohnanzaAction): BohnanzaState {
  if (state.phase === "done") return state;

  // CPU turns: only respond to cpuStep
  if (state.phase === "cpuTurn") {
    if (action.type !== "cpuStep") return state;
    return runCpuTurn(state, state.current);
  }

  if (state.current !== 0) return state;

  switch (action.type) {
    case "plantFirst": {
      if (state.phase !== "plantFirst" && state.phase !== "plantSecondOptional") return state;
      const p = state.players[0]!;
      if (p.hand.length === 0) {
        if (state.phase === "plantFirst") {
          return { ...state, phase: "plantSecondOptional", message: "Hand empty. Skip second plant." };
        }
        return state;
      }
      const card = p.hand[0]!;
      // Determine if planting needs a player choice
      const matchIdx = p.fields.findIndex((f) => f.bean === card);
      const emptyIdx = p.fields.findIndex((f) => f.bean === null);
      // First plant transitions to "plantSecondOptional"; the optional
      // second plant transitions to "plantSecondOptional" still — but the
      // caller MUST then call skipSecondPlant (or the reveal button) to
      // advance, since this handler enforces only-2-plants-per-turn at the
      // top of the case (no field-match/empty action available chain).
      const nextPhase: Phase = "plantSecondOptional";
      const nextMsg = state.phase === "plantFirst"
        ? "Optionally plant the next card, or skip."
        : "Click Reveal to flip 2 trade cards.";
      if (matchIdx !== -1) {
        const plant = plantBean(state.players, 0, card, matchIdx);
        const np = plant.players.slice();
        np[0] = { ...np[0]!, hand: np[0]!.hand.slice(1) };
        return {
          ...state,
          players: np,
          discard: state.discard.concat(plant.discarded),
          phase: nextPhase,
          pendingPlant: null,
          message: nextMsg,
          log: state.log.concat([`You planted ${BEANS[card].name}.`]),
        };
      }
      if (emptyIdx !== -1) {
        // Auto-plant into the first empty field. The two fields are
        // symmetrical when both empty so picking field 0 is fine.
        const plant = plantBean(state.players, 0, card, emptyIdx);
        const np = plant.players.slice();
        np[0] = { ...np[0]!, hand: np[0]!.hand.slice(1) };
        return {
          ...state,
          players: np,
          discard: state.discard.concat(plant.discarded),
          phase: nextPhase,
          pendingPlant: null,
          message: nextMsg,
          log: state.log.concat([`You planted ${BEANS[card].name}.`]),
        };
      }
      return { ...state, pendingPlant: card, message: `No matching/empty field. Pick a field to harvest and replant ${BEANS[card].name}.` };
    }
    case "plantInto": {
      if (state.pendingPlant === null) return state;
      const bean = state.pendingPlant;
      const fieldIdx = action.fieldIndex;
      if (fieldIdx < 0 || fieldIdx >= NUM_FIELDS) return state;
      const plant = plantBean(state.players, 0, bean, fieldIdx);
      if (!plant.planted) return state;
      const np = plant.players.slice();
      // We must remove the bean from hand. We need to know which phase requested this plant.
      // For plantFirst, the bean is hand[0]; we shift.
      // For plantSecondOptional, the bean is hand[0]; we shift.
      // For revealed planting we use a separate action plantRevealedInto.
      const me = np[0]!;
      if (me.hand[0] === bean) {
        np[0] = { ...me, hand: me.hand.slice(1) };
      }
      // Same end-of-plant transition rule as plantFirst: after the optional
      // second plant resolves, advance to tradePhase so the player can no
      // longer chain plants from this hand.
      const nextPhase: Phase = state.phase === "plantFirst" ? "plantSecondOptional" : "tradePhase";
      const msg = state.phase === "plantSecondOptional"
        ? "Click Reveal to flip 2 trade cards."
        : "Optionally plant the next card, or skip.";
      return {
        ...state,
        players: np,
        discard: state.discard.concat(plant.discarded),
        phase: nextPhase,
        pendingPlant: null,
        message: msg,
        log: state.log.concat([`You planted ${BEANS[bean].name}.`]),
      };
    }
    case "skipSecondPlant": {
      if (state.phase !== "plantSecondOptional") return state;
      // Move to trade reveal
      const r = drawFromDeck(state.deck, state.discard, state.deckCyclesUsed, state.rngSeed, TRADE_DRAW);
      if (r.cyclesUsed >= DECK_CYCLES_TO_END) {
        const players = finalHarvest(state.players);
        return {
          ...state,
          players,
          deck: r.deck,
          discard: r.discard,
          deckCyclesUsed: r.cyclesUsed,
          rngSeed: r.nextSeed,
          phase: "done",
          message: "Game over.",
          log: state.log.concat(["Deck cycled 3 times. Final score."]),
        };
      }
      return {
        ...state,
        deck: r.deck,
        discard: r.discard,
        deckCyclesUsed: r.cyclesUsed,
        rngSeed: r.nextSeed,
        revealed: r.drawn,
        phase: "tradePhase",
        message: "Trade phase: revealed cards listed. CPU auto-trade — click Accept to plant remaining.",
        log: state.log.concat([`Revealed: ${r.drawn.map((b) => BEANS[b].name).join(", ") || "(none)"}.`]),
      };
    }
    case "endTurn": {
      // From tradePhase: skip to planting revealed cards
      if (state.phase === "tradePhase") {
        // Auto: don't make any trades. Move to planting revealed.
        if (state.revealed.length === 0) {
          // draw 3 and advance
          return finishTurn(state);
        }
        return { ...state, phase: "plantRevealed", message: "Plant or discard each revealed card." };
      }
      if (state.phase === "drawEnd") {
        return finishTurn(state);
      }
      return state;
    }
    case "plantRevealedInto": {
      if (state.phase !== "plantRevealed") return state;
      if (state.revealed.length === 0) return state;
      const bean = state.revealed[0]!;
      const fieldIdx = action.fieldIndex;
      if (fieldIdx < 0 || fieldIdx >= NUM_FIELDS) return state;
      const plant = plantBean(state.players, 0, bean, fieldIdx);
      if (!plant.planted) return state;
      const newRevealed = state.revealed.slice(1);
      const np = plant.players;
      const msg = newRevealed.length > 0 ? "Plant the next revealed card." : "Click End Turn to draw 3.";
      if (newRevealed.length === 0) {
        return {
          ...state,
          players: np,
          discard: state.discard.concat(plant.discarded),
          revealed: newRevealed,
          phase: "drawEnd",
          message: msg,
          log: state.log.concat([`You planted revealed ${BEANS[bean].name}.`]),
        };
      }
      return {
        ...state,
        players: np,
        discard: state.discard.concat(plant.discarded),
        revealed: newRevealed,
        message: msg,
        log: state.log.concat([`You planted revealed ${BEANS[bean].name}.`]),
      };
    }
    case "skipRevealedPlant": {
      if (state.phase !== "plantRevealed") return state;
      if (state.revealed.length === 0) return state;
      const bean = state.revealed[0]!;
      const newRevealed = state.revealed.slice(1);
      const newPhase: Phase = newRevealed.length === 0 ? "drawEnd" : "plantRevealed";
      const msg = newRevealed.length > 0 ? "Plant or discard the next revealed card." : "Click End Turn to draw 3.";
      return {
        ...state,
        discard: state.discard.concat([bean]),
        revealed: newRevealed,
        phase: newPhase,
        message: msg,
        log: state.log.concat([`You discarded revealed ${BEANS[bean].name}.`]),
      };
    }
    case "harvestField": {
      // Allowed during any non-done human phase
      const fIdx = action.fieldIndex;
      if (fIdx < 0 || fIdx >= NUM_FIELDS) return state;
      const h = harvestFieldInPlayer(state.players, 0, fIdx);
      if (h.harvestedBean === null) return state;
      return {
        ...state,
        players: h.players,
        discard: state.discard.concat(h.discarded),
        log: state.log.concat([`You harvested ${BEANS[h.harvestedBean].name} for ${h.coinsGained} coin${h.coinsGained === 1 ? "" : "s"}.`]),
      };
    }
    default:
      return state;
  }
}

function finishTurn(state: BohnanzaState): BohnanzaState {
  // Draw 3 to back of hand, advance to next player.
  const r = drawFromDeck(state.deck, state.discard, state.deckCyclesUsed, state.rngSeed, TURN_END_DRAW);
  let players = state.players.slice();
  const me = players[0]!;
  players[0] = { ...me, hand: me.hand.concat(r.drawn) };
  if (r.cyclesUsed >= DECK_CYCLES_TO_END) {
    players = finalHarvest(players);
    return {
      ...state,
      players,
      deck: r.deck,
      discard: r.discard,
      deckCyclesUsed: r.cyclesUsed,
      rngSeed: r.nextSeed,
      phase: "done",
      message: "Game over.",
      revealed: [],
      log: state.log.concat(["Deck cycled 3 times. Final score."]),
    };
  }
  const nextIdx = 1;
  return {
    ...state,
    players,
    deck: r.deck,
    discard: r.discard,
    deckCyclesUsed: r.cyclesUsed,
    rngSeed: r.nextSeed,
    revealed: [],
    pendingPlant: null,
    current: nextIdx,
    phase: "cpuTurn",
    message: `P${nextIdx + 1} is thinking...`,
    log: state.log.concat([`You drew ${r.drawn.length} card${r.drawn.length === 1 ? "" : "s"}.`]),
  };
}
