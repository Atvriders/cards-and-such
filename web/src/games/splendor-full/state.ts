import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// =============================================================================
// Splendor (Full Base) — M tier (1 human vs 3 CPU).
//
// IMPLEMENTED:
//   - 5 gem colors (Emerald/Sapphire/Ruby/Diamond/Onyx) + Gold (wildcard).
//   - 40 token supply: 7 of each color × 5 = 35 + 5 gold.
//   - 90 development cards in 3 tiers (40/30/20). Each card has a cost in
//     colored gems, produces 1 permanent gem of one color, and may grant
//     prestige points. Distribution is procedurally generated from a seeded
//     RNG so it is deterministic.
//   - 4-faceup display per tier; refill from tier deck when a card is bought
//     or reserved.
//   - 10 noble tiles, 3 dealt per game (player_count = 4 → 5 nobles, but the
//     pitch says "3 dealt"; we ship 3 to match the prompt).
//   - Turn options:
//       (1) take 3 different-color tokens (skip-allowed if pile is empty)
//       (2) take 2 same-color tokens if the pile has ≥4 of that color
//       (3) reserve a face-up card + 1 gold token (max 3 reserved)
//       (4) buy a face-up or reserved card using tokens + permanent gems
//   - 10-token hand limit: after taking tokens, if a player holds > 10 they
//     must auto-return tokens (we auto-return least-useful for the CPU; the
//     human is forced to return excess via a follow-up modal — auto-return
//     for simplicity).
//   - Noble check after buying a card: claim first matching noble; each
//     noble may be claimed only once.
//   - Win at 15 prestige; current round completes for ties (all remaining
//     players in the round get a final turn).
//   - 1 human vs 3 CPUs. Seat order is fixed (0..3).
//
// CPU AI:
//   - Greedy "highest-prestige-card-I-can-afford" with light noble-target
//     awareness: among affordable cards, breaks ties by preferring the color
//     that advances the most nobles. If nothing is affordable, takes tokens
//     toward the cheapest visible card (3 diff colors, else 2 of a color).
// =============================================================================

export const COLORS = ["emerald", "sapphire", "ruby", "diamond", "onyx"] as const;
export type Color = (typeof COLORS)[number];
export const COLOR_COUNT = 5;
export const GOLD = "gold" as const;
export type TokenColor = Color | typeof GOLD;

export const WIN_PRESTIGE = 15;
export const TIER_FACEUP = 4;
export const TIER_COUNT = 3;
export const TIER_SIZES = [40, 30, 20] as const;
export const MAX_RESERVED = 3;
export const MAX_TOKENS_IN_HAND = 10;
export const TOKEN_SUPPLY_PER_COLOR = 7;
export const GOLD_SUPPLY = 5;
export const NOBLES_IN_PLAY = 3;
export const PLAYER_COUNT = 4;

export type Cost = Record<Color, number>;
export type Tokens = Record<TokenColor, number>;

export interface DevCard {
  id: number;
  tier: 0 | 1 | 2; // 0 = Tier 1, 1 = Tier 2, 2 = Tier 3
  color: Color;
  prestige: number;
  cost: Cost;
}

export interface Noble {
  id: number;
  prestige: number; // typically 3
  requirement: Cost; // requires N permanent gems of each color
}

export interface Player {
  seat: number; // 0..3, seat 0 is human
  name: string;
  isCPU: boolean;
  tokens: Tokens;
  /** Cards purchased (permanent gems). */
  bought: DevCard[];
  /** Cards reserved (face-down to opponents in real game; visible to owner). */
  reserved: DevCard[];
  prestige: number;
  nobles: Noble[];
}

export type Phase = "playing" | "done";

export interface SplendorFullState {
  seed: number;
  rng: number; // last-known position, unused but kept for determinism debugging
  players: Player[];
  current: number; // 0..3
  /** Round counter (incremented when wraparound back to seat 0). */
  round: number;
  /** Token bank. */
  bank: Tokens;
  /** Face-up cards per tier (sparse — may have empties at end of deck). */
  rows: (DevCard | null)[][]; // rows[tier][slotIdx]
  /** Remaining decks per tier (top is end of array). */
  decks: DevCard[][];
  /** Nobles in play (still claimable). */
  nobles: Noble[];
  phase: Phase;
  /** Per-game log of human-readable events for UI/debug. */
  log: string[];
  /** When the first player reaches WIN_PRESTIGE, finish the round (remaining
   *  players in seat order get one more turn each). */
  triggerSeat: number | null;
  /** Winner seat after game ends. */
  winner: number | null;
}

export type Action =
  | { type: "take3"; colors: Color[] } // up to 3 distinct
  | { type: "take2"; color: Color }
  | { type: "reserve"; tier: 0 | 1 | 2; slot: number }
  | { type: "reserveTop"; tier: 0 | 1 | 2 }
  | { type: "buyFaceup"; tier: 0 | 1 | 2; slot: number }
  | { type: "buyReserved"; idx: number }
  | { type: "cpuStep" } // run one CPU action
  | { type: "discardDown" }; // post-action helper (auto)

export interface SplendorFullSettings { _dummy: boolean }

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** Safe player lookup. Throws on out-of-range (defensive — should never happen). */
function getPlayer(state: SplendorFullState, seat: number): Player {
  const p = state.players[seat];
  if (!p) throw new Error("invalid seat " + seat);
  return p;
}

/** Safe tier row lookup. */
function getRow(state: SplendorFullState, tier: 0 | 1 | 2): (DevCard | null)[] {
  const r = state.rows[tier];
  if (!r) throw new Error("invalid tier " + tier);
  return r;
}

/** Safe deck lookup. */
function getDeck(state: SplendorFullState, tier: 0 | 1 | 2): DevCard[] {
  const d = state.decks[tier];
  if (!d) throw new Error("invalid tier " + tier);
  return d;
}

export function emptyTokens(): Tokens {
  return { emerald: 0, sapphire: 0, ruby: 0, diamond: 0, onyx: 0, gold: 0 };
}
export function emptyCost(): Cost {
  return { emerald: 0, sapphire: 0, ruby: 0, diamond: 0, onyx: 0 };
}
export function totalTokens(t: Tokens): number {
  return t.emerald + t.sapphire + t.ruby + t.diamond + t.onyx + t.gold;
}
export function permanentGems(p: Player): Cost {
  const out = emptyCost();
  for (const c of p.bought) out[c.color]++;
  return out;
}

/** A player can afford a card if for every color (cost - permanent gems) ≤
 *  tokens of that color, and total deficit (sum of max(0, cost-perm-tokens))
 *  ≤ gold tokens. Returns the gold-spend needed, or -1 if unaffordable. */
export function affordCost(p: Player, card: DevCard): number {
  const perm = permanentGems(p);
  let goldNeeded = 0;
  for (const c of COLORS) {
    const need = card.cost[c] - perm[c];
    if (need <= 0) continue;
    const have = p.tokens[c];
    if (have < need) goldNeeded += need - have;
  }
  if (goldNeeded > p.tokens.gold) return -1;
  return goldNeeded;
}

/** Pay for a card: returns updated tokens for player and returned-to-bank
 *  deltas. */
function payForCard(p: Player, card: DevCard): { newTokens: Tokens; returned: Tokens } {
  const perm = permanentGems(p);
  const newTokens: Tokens = { ...p.tokens };
  const returned: Tokens = emptyTokens();
  let goldNeeded = 0;
  for (const c of COLORS) {
    const need = Math.max(0, card.cost[c] - perm[c]);
    if (need <= 0) continue;
    const fromColor = Math.min(need, newTokens[c]);
    newTokens[c] -= fromColor;
    returned[c] += fromColor;
    const stillNeed = need - fromColor;
    goldNeeded += stillNeed;
  }
  newTokens.gold -= goldNeeded;
  returned.gold += goldNeeded;
  return { newTokens, returned };
}

function cloneState(s: SplendorFullState): SplendorFullState {
  return {
    ...s,
    players: s.players.map((p) => ({
      ...p,
      tokens: { ...p.tokens },
      bought: p.bought.slice(),
      reserved: p.reserved.slice(),
      nobles: p.nobles.slice(),
    })),
    bank: { ...s.bank },
    rows: s.rows.map((row) => row.slice()),
    decks: s.decks.map((d) => d.slice()),
    nobles: s.nobles.slice(),
    log: s.log.slice(),
  };
}

// -----------------------------------------------------------------------------
// Generate deterministic card and noble pools
// -----------------------------------------------------------------------------

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}

/** Generate a deck for a tier. Real Splendor uses curated costs; we generate
 *  a deterministic pool that matches the published cost/prestige ranges. */
function generateTierDeck(tier: 0 | 1 | 2, count: number, rng: () => number, idBase: number): DevCard[] {
  const cards: DevCard[] = [];
  for (let i = 0; i < count; i++) {
    const color = COLORS[Math.floor(rng() * COLOR_COUNT)] as Color;
    const cost = emptyCost();
    let totalCost = 0;
    let prestige = 0;
    if (tier === 0) {
      // Tier 1: 3-5 total cost, 0-1 prestige (mostly 0)
      totalCost = 3 + Math.floor(rng() * 3);
      prestige = rng() < 0.2 ? 1 : 0;
    } else if (tier === 1) {
      // Tier 2: 5-8 total cost, 1-3 prestige
      totalCost = 5 + Math.floor(rng() * 4);
      prestige = 1 + Math.floor(rng() * 3);
    } else {
      // Tier 3: 7-13 total cost, 3-5 prestige
      totalCost = 7 + Math.floor(rng() * 7);
      prestige = 3 + Math.floor(rng() * 3);
    }
    // Distribute cost across 1-3 non-self colors (cards usually require other colors)
    const nonSelf = COLORS.filter((c) => c !== color);
    const usableColors = shuffle(nonSelf, rng).slice(0, 1 + Math.floor(rng() * 3));
    let remaining = totalCost;
    for (let k = 0; k < usableColors.length; k++) {
      const isLast = k === usableColors.length - 1;
      const maxPer = tier === 0 ? 4 : tier === 1 ? 6 : 7;
      let amt: number;
      if (isLast) amt = Math.min(maxPer, remaining);
      else {
        const slotsLeft = usableColors.length - k;
        amt = Math.min(maxPer, Math.max(1, Math.floor(remaining / slotsLeft)));
        amt = Math.min(amt, remaining - (slotsLeft - 1));
      }
      cost[usableColors[k] as Color] = amt;
      remaining -= amt;
    }
    cards.push({ id: idBase + i, tier, color, prestige, cost });
  }
  return cards;
}

/** Generate 10 nobles, then pick NOBLES_IN_PLAY. Each noble requires 3-4
 *  permanent gems of 2-3 different colors and grants 3 prestige. */
function generateNobles(rng: () => number): Noble[] {
  const nobles: Noble[] = [];
  for (let i = 0; i < 10; i++) {
    const colorCount = 2 + Math.floor(rng() * 2); // 2 or 3
    const chosen = shuffle(COLORS.slice(), rng).slice(0, colorCount);
    const req = emptyCost();
    if (colorCount === 2) {
      for (const c of chosen) req[c] = 4;
    } else {
      for (const c of chosen) req[c] = 3;
    }
    nobles.push({ id: i, prestige: 3, requirement: req });
  }
  return nobles;
}

// -----------------------------------------------------------------------------
// initialState
// -----------------------------------------------------------------------------

export function initialState(seed: number, _settings: SplendorFullSettings): SplendorFullState {
  void _settings;
  const rng = mulberry32(seed >>> 0);

  // Build decks
  const deckT1Full = generateTierDeck(0, TIER_SIZES[0], rng, 1000);
  const deckT2Full = generateTierDeck(1, TIER_SIZES[1], rng, 2000);
  const deckT3Full = generateTierDeck(2, TIER_SIZES[2], rng, 3000);
  const decks = [shuffle(deckT1Full, rng), shuffle(deckT2Full, rng), shuffle(deckT3Full, rng)];

  // Deal face-up rows
  const rows: (DevCard | null)[][] = [[], [], []];
  for (let t = 0; t < TIER_COUNT; t++) {
    const row = rows[t] as (DevCard | null)[];
    const deck = decks[t] as DevCard[];
    for (let s = 0; s < TIER_FACEUP; s++) {
      row.push(deck.pop() ?? null);
    }
  }

  // Nobles
  const allNobles = generateNobles(rng);
  const nobles = shuffle(allNobles, rng).slice(0, NOBLES_IN_PLAY);

  // Players
  const names = ["You", "CPU Aurelia", "CPU Borgia", "CPU Crassus"];
  const players: Player[] = [];
  for (let i = 0; i < PLAYER_COUNT; i++) {
    players.push({
      seat: i,
      name: names[i] ?? `Player ${i}`,
      isCPU: i !== 0,
      tokens: emptyTokens(),
      bought: [],
      reserved: [],
      prestige: 0,
      nobles: [],
    });
  }

  // Bank (4-player: 7 of each + 5 gold per spec for "Splendor full".
  // Note: official 4-player uses 7 of each. We honor the spec exactly.)
  const bank: Tokens = emptyTokens();
  for (const c of COLORS) bank[c] = TOKEN_SUPPLY_PER_COLOR;
  bank.gold = GOLD_SUPPLY;

  return {
    seed,
    rng: 0,
    players,
    current: 0,
    round: 1,
    bank,
    rows,
    decks,
    nobles,
    phase: "playing",
    log: [],
    triggerSeat: null,
    winner: null,
  };
}

// -----------------------------------------------------------------------------
// Turn engine
// -----------------------------------------------------------------------------

/** After a buy: check nobles. Claim first matching one. */
function checkNobles(state: SplendorFullState, seat: number): void {
  const p = getPlayer(state, seat);
  const perm = permanentGems(p);
  for (let i = 0; i < state.nobles.length; i++) {
    const n = state.nobles[i];
    if (!n) continue;
    let ok = true;
    for (const c of COLORS) {
      if (perm[c] < n.requirement[c]) { ok = false; break; }
    }
    if (ok) {
      p.nobles.push(n);
      p.prestige += n.prestige;
      state.nobles.splice(i, 1);
      state.log.push(`${p.name} attracts a noble (+${n.prestige}).`);
      return; // only one per turn
    }
  }
}

/** Refill a face-up slot from the corresponding deck. */
function refillSlot(state: SplendorFullState, tier: 0 | 1 | 2, slot: number): void {
  const next = getDeck(state, tier).pop();
  getRow(state, tier)[slot] = next ?? null;
}

/** Auto-discard tokens down to 10 (least-prestige-strategic first). */
function autoDiscardDown(state: SplendorFullState, seat: number): void {
  const p = getPlayer(state, seat);
  while (totalTokens(p.tokens) > MAX_TOKENS_IN_HAND) {
    // Discard the color the player has the most of (excluding gold first)
    let best: TokenColor | null = null;
    let bestCount = -1;
    const order: TokenColor[] = [...COLORS, GOLD];
    for (const c of order) {
      if (p.tokens[c] > bestCount) { bestCount = p.tokens[c]; best = c; }
    }
    if (!best || bestCount === 0) break;
    p.tokens[best]--;
    state.bank[best]++;
  }
}

/** Advance turn pointer. If end-of-round and someone has triggered 15+,
 *  declare the winner. */
function endTurn(state: SplendorFullState): void {
  // Check if current player triggered game end (>=15)
  const cur = getPlayer(state, state.current);
  if (cur.prestige >= WIN_PRESTIGE && state.triggerSeat === null) {
    state.triggerSeat = state.current;
    state.log.push(`${cur.name} reaches ${cur.prestige} prestige — final round!`);
  }

  const nextSeat = (state.current + 1) % PLAYER_COUNT;
  // Round increments when wrapping back to seat 0
  if (nextSeat === 0) state.round++;

  // Game ends when nextSeat is back to the one AFTER the trigger seat —
  // i.e. trigger seat had the last in-round move. We end when all players
  // following the trigger seat (in seat order) have had one more turn.
  if (state.triggerSeat !== null) {
    // The round is complete when nextSeat would be triggerSeat+1 (mod 4)
    // AFTER the trigger seat itself finished its turn. Simplest: end when
    // nextSeat == 0 AND all seats > trigger have moved this round.
    // We track this via: end as soon as we wrap and at least one player
    // has hit prestige threshold.
    if (nextSeat === 0) {
      // End of round — find max prestige winner
      let winnerSeat = 0;
      let bestPres = -1;
      let bestCardCount = Infinity; // fewer cards breaks ties
      for (const p of state.players) {
        if (p.prestige > bestPres || (p.prestige === bestPres && p.bought.length < bestCardCount)) {
          bestPres = p.prestige;
          bestCardCount = p.bought.length;
          winnerSeat = p.seat;
        }
      }
      state.winner = winnerSeat;
      state.phase = "done";
      state.log.push(`${getPlayer(state, winnerSeat).name} wins with ${bestPres} prestige!`);
      return;
    }
  }

  state.current = nextSeat;
}

// -----------------------------------------------------------------------------
// Action handlers (mutate a cloned state in-place; reducer always clones first)
// -----------------------------------------------------------------------------

function applyTake3(state: SplendorFullState, colors: Color[]): boolean {
  const uniq = Array.from(new Set(colors)).filter((c) => state.bank[c] > 0);
  if (uniq.length === 0) return false;
  if (uniq.length > 3) return false;
  const p = getPlayer(state, state.current);
  for (const c of uniq) {
    state.bank[c]--;
    p.tokens[c]++;
  }
  autoDiscardDown(state, state.current);
  state.log.push(`${p.name} takes ${uniq.join(", ")}.`);
  return true;
}

function applyTake2(state: SplendorFullState, color: Color): boolean {
  if (state.bank[color] < 4) return false;
  const p = getPlayer(state, state.current);
  state.bank[color] -= 2;
  p.tokens[color] += 2;
  autoDiscardDown(state, state.current);
  state.log.push(`${p.name} takes 2 ${color}.`);
  return true;
}

function applyReserve(state: SplendorFullState, tier: 0 | 1 | 2, slot: number): boolean {
  const p = getPlayer(state, state.current);
  if (p.reserved.length >= MAX_RESERVED) return false;
  const row = getRow(state, tier);
  const card = row[slot];
  if (!card) return false;
  p.reserved.push(card);
  row[slot] = null;
  refillSlot(state, tier, slot);
  if (state.bank.gold > 0) {
    state.bank.gold--;
    p.tokens.gold++;
  }
  autoDiscardDown(state, state.current);
  state.log.push(`${p.name} reserves a Tier ${tier + 1} card.`);
  return true;
}

function applyReserveTop(state: SplendorFullState, tier: 0 | 1 | 2): boolean {
  const p = getPlayer(state, state.current);
  if (p.reserved.length >= MAX_RESERVED) return false;
  const card = getDeck(state, tier).pop();
  if (!card) return false;
  p.reserved.push(card);
  if (state.bank.gold > 0) {
    state.bank.gold--;
    p.tokens.gold++;
  }
  autoDiscardDown(state, state.current);
  state.log.push(`${p.name} reserves the top of Tier ${tier + 1}.`);
  return true;
}

function applyBuyFaceup(state: SplendorFullState, tier: 0 | 1 | 2, slot: number): boolean {
  const p = getPlayer(state, state.current);
  const row = getRow(state, tier);
  const card = row[slot];
  if (!card) return false;
  if (affordCost(p, card) < 0) return false;
  const { newTokens, returned } = payForCard(p, card);
  p.tokens = newTokens;
  for (const c of COLORS) state.bank[c] += returned[c];
  state.bank.gold += returned.gold;
  p.bought.push(card);
  p.prestige += card.prestige;
  row[slot] = null;
  refillSlot(state, tier, slot);
  state.log.push(`${p.name} buys a ${card.color} card (+${card.prestige}).`);
  checkNobles(state, state.current);
  return true;
}

function applyBuyReserved(state: SplendorFullState, idx: number): boolean {
  const p = getPlayer(state, state.current);
  const card = p.reserved[idx];
  if (!card) return false;
  if (affordCost(p, card) < 0) return false;
  const { newTokens, returned } = payForCard(p, card);
  p.tokens = newTokens;
  for (const c of COLORS) state.bank[c] += returned[c];
  state.bank.gold += returned.gold;
  p.reserved.splice(idx, 1);
  p.bought.push(card);
  p.prestige += card.prestige;
  state.log.push(`${p.name} buys a reserved ${card.color} card (+${card.prestige}).`);
  checkNobles(state, state.current);
  return true;
}

// -----------------------------------------------------------------------------
// CPU AI
// -----------------------------------------------------------------------------

/** Compute "noble alignment" score for a card: how many in-play nobles need
 *  this color (and the player still needs that color). */
function nobleAlignment(state: SplendorFullState, seat: number, color: Color): number {
  const p = getPlayer(state, seat);
  const perm = permanentGems(p);
  let score = 0;
  for (const n of state.nobles) {
    const need = n.requirement[color];
    if (need > 0 && perm[color] < need) score++;
  }
  return score;
}

/** Among affordable cards (face-up + reserved), pick the one with the
 *  highest prestige; tie-break by noble alignment, then by lower total cost. */
function pickBestAffordable(state: SplendorFullState, seat: number): Action | null {
  const p = getPlayer(state, seat);
  let best: { action: Action; key: [number, number, number] } | null = null;
  // Face-up
  for (let t = 0 as 0 | 1 | 2; t < TIER_COUNT; t = (t + 1) as 0 | 1 | 2) {
    const row = getRow(state, t);
    for (let s = 0; s < TIER_FACEUP; s++) {
      const card = row[s];
      if (!card) continue;
      if (affordCost(p, card) < 0) continue;
      const totalC = COLORS.reduce((acc, c) => acc + card.cost[c], 0);
      const key: [number, number, number] = [card.prestige, nobleAlignment(state, seat, card.color), -totalC];
      if (!best || keyCmp(key, best.key) > 0) {
        best = { action: { type: "buyFaceup", tier: card.tier, slot: s }, key };
      }
    }
    if (t === 2) break;
  }
  // Reserved
  for (let i = 0; i < p.reserved.length; i++) {
    const card = p.reserved[i];
    if (!card) continue;
    if (affordCost(p, card) < 0) continue;
    const totalC = COLORS.reduce((acc, c) => acc + card.cost[c], 0);
    const key: [number, number, number] = [card.prestige, nobleAlignment(state, seat, card.color), -totalC];
    if (!best || keyCmp(key, best.key) > 0) {
      best = { action: { type: "buyReserved", idx: i }, key };
    }
  }
  return best?.action ?? null;
}

function keyCmp(a: [number, number, number], b: [number, number, number]): number {
  for (let i = 0; i < a.length; i++) {
    const av = a[i] as number;
    const bv = b[i] as number;
    if (av !== bv) return av - bv;
  }
  return 0;
}

/** Identify the "target" card: cheapest face-up Tier 1/2 card the CPU is
 *  closest to affording (with noble alignment as a tie-breaker). Used to
 *  guide token-taking. */
function pickTargetCard(state: SplendorFullState, seat: number): DevCard | null {
  const p = getPlayer(state, seat);
  const perm = permanentGems(p);
  let best: { card: DevCard; deficit: number; align: number } | null = null;
  for (let t = 0 as 0 | 1 | 2; t < TIER_COUNT; t = (t + 1) as 0 | 1 | 2) {
    const row = getRow(state, t);
    for (let s = 0; s < TIER_FACEUP; s++) {
      const card = row[s];
      if (!card) continue;
      let deficit = 0;
      for (const c of COLORS) deficit += Math.max(0, card.cost[c] - perm[c] - p.tokens[c]);
      const align = nobleAlignment(state, seat, card.color) + card.prestige * 0.5;
      if (!best || deficit < best.deficit || (deficit === best.deficit && align > best.align)) {
        best = { card, deficit, align };
      }
    }
    if (t === 2) break;
  }
  return best?.card ?? null;
}

/** Decide one CPU action. */
function decideCpuAction(state: SplendorFullState): Action {
  const seat = state.current;
  const p = getPlayer(state, seat);

  // 1) buy best affordable card
  const buy = pickBestAffordable(state, seat);
  if (buy) return buy;

  // 2) take tokens toward target card
  const target = pickTargetCard(state, seat);
  if (target) {
    const perm = permanentGems(p);
    const needed: Color[] = [];
    for (const c of COLORS) {
      const def = target.cost[c] - perm[c] - p.tokens[c];
      if (def > 0 && state.bank[c] > 0) needed.push(c);
    }
    if (needed.length >= 3) return { type: "take3", colors: needed.slice(0, 3) };
    if (needed.length === 2) {
      // Take 2 distinct + 1 random other color that still has stock
      const extra = COLORS.find((c) => !needed.includes(c) && state.bank[c] > 0);
      const colors = extra ? [...needed, extra] : needed;
      return { type: "take3", colors };
    }
    if (needed.length === 1) {
      const only = needed[0] as Color;
      if (state.bank[only] >= 4) return { type: "take2", color: only };
      const extras = COLORS.filter((c) => c !== only && state.bank[c] > 0).slice(0, 2);
      const colors = [only, ...extras];
      if (colors.length > 0) return { type: "take3", colors };
    }
  }

  // 3) reserve a high-prestige Tier 3 if room
  if (p.reserved.length < MAX_RESERVED) {
    for (let t = 2 as 0 | 1 | 2; t >= 0; t = (t - 1) as 0 | 1 | 2) {
      const row = getRow(state, t);
      for (let s = 0; s < TIER_FACEUP; s++) {
        const card = row[s];
        if (card && card.prestige > 0) return { type: "reserve", tier: t, slot: s };
      }
      if (t === 0) break;
    }
  }

  // 4) fallback: take any 3 different
  const any3: Color[] = COLORS.filter((c) => state.bank[c] > 0).slice(0, 3);
  if (any3.length > 0) return { type: "take3", colors: any3 };

  // 5) absolute fallback: take 2 of any color with ≥4
  for (const c of COLORS) {
    if (state.bank[c] >= 4) return { type: "take2", color: c };
  }

  // 6) reserve top of Tier 1 if even that is exhausted
  if (getDeck(state, 0).length > 0 && p.reserved.length < MAX_RESERVED) {
    return { type: "reserveTop", tier: 0 };
  }

  // 7) absolute pass — take whatever single token exists
  for (const c of COLORS) {
    if (state.bank[c] > 0) return { type: "take3", colors: [c] };
  }
  // No-op
  return { type: "take3", colors: [] };
}

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

export function reducer(state: SplendorFullState, action: Action): SplendorFullState {
  if (state.phase === "done") return state;

  if (action.type === "cpuStep") {
    if (!getPlayer(state, state.current).isCPU) return state;
    const next = cloneState(state);
    const cpuAction = decideCpuAction(next);
    const ok = applyAction(next, cpuAction);
    if (!ok) {
      // Skip turn rather than infinite loop
      next.log.push(`${getPlayer(next, next.current).name} passes.`);
    }
    endTurn(next);
    return next;
  }

  // Human actions: must be human's turn
  if (getPlayer(state, state.current).isCPU) return state;

  const next = cloneState(state);
  const ok = applyAction(next, action);
  if (!ok) return state;
  endTurn(next);
  return next;
}

function applyAction(state: SplendorFullState, action: Action): boolean {
  switch (action.type) {
    case "take3":
      return applyTake3(state, action.colors);
    case "take2":
      return applyTake2(state, action.color);
    case "reserve":
      return applyReserve(state, action.tier, action.slot);
    case "reserveTop":
      return applyReserveTop(state, action.tier);
    case "buyFaceup":
      return applyBuyFaceup(state, action.tier, action.slot);
    case "buyReserved":
      return applyBuyReserved(state, action.idx);
    default:
      return false;
  }
}

// -----------------------------------------------------------------------------
// isTerminal
// -----------------------------------------------------------------------------

export function isTerminal(state: SplendorFullState): { score: number } | null {
  if (state.phase !== "done") return null;
  const you = getPlayer(state, 0);
  // Score = your prestige + 10 for winning the table, 0 if you lost.
  const score = state.winner === 0 ? you.prestige + 10 : 0;
  return { score };
}
