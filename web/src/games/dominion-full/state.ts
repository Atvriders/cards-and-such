import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Dominion (Full Base Set) — a canonical 2-player (you vs. one or two CPU
 * opponents) deckbuilder. Each player starts with 7 Coppers + 3 Estates.
 * Turn = Action phase, Buy phase, Cleanup. Game ends when Province pile is
 * empty OR three supply piles are empty. Final score = sum of victory points
 * across each player's whole deck minus Curses.
 *
 * NOTE: Implements 8 Kingdom cards from the listed base set:
 *   Cellar, Moat, Village, Workshop, Festival, Laboratory, Market, Smithy.
 * (Chapel/Bureaucrat/Witch/Adventurer are described in howToPlay but not
 * shuffled into this setup — see TODO below.)
 *
 * TODO (advanced rules / cards omitted from L-tier scope):
 *  - Chapel (trash up to 4 cards from hand)
 *  - Bureaucrat (gain silver to deck, attack: reveal/return a victory)
 *  - Witch (+2 cards, attack: each other gains a Curse)
 *  - Adventurer (reveal until 2 treasures revealed)
 *  - Reaction interrupts (Moat in this build does NOT block attacks because
 *    no attacks are present — it's only a +2 cards action)
 */

export const HAND_SIZE = 5;

// -------------------------------------------------------------------------
// Settings
// -------------------------------------------------------------------------

export interface DominionFullSettings {
  cpuCount: 1 | 2;
}

// -------------------------------------------------------------------------
// Card definitions
// -------------------------------------------------------------------------

export type CardKind = "treasure" | "victory" | "curse" | "action";

export interface CardDef {
  id: string;
  name: string;
  cost: number;
  coin: number;
  vp: number;
  kind: CardKind;
  /** action card effects (only populated when kind === "action") */
  plusCards?: number;
  plusActions?: number;
  plusBuys?: number;
  plusCoin?: number;
  /** action card has a special handler */
  special?: "cellar" | "workshop";
}

const TREASURE_CARDS: readonly CardDef[] = [
  { id: "copper", name: "Copper", cost: 0, coin: 1, vp: 0, kind: "treasure" },
  { id: "silver", name: "Silver", cost: 3, coin: 2, vp: 0, kind: "treasure" },
  { id: "gold", name: "Gold", cost: 6, coin: 3, vp: 0, kind: "treasure" },
];

const VICTORY_CARDS: readonly CardDef[] = [
  { id: "estate", name: "Estate", cost: 2, coin: 0, vp: 1, kind: "victory" },
  { id: "duchy", name: "Duchy", cost: 5, coin: 0, vp: 3, kind: "victory" },
  { id: "province", name: "Province", cost: 8, coin: 0, vp: 6, kind: "victory" },
];

const CURSE_CARD: CardDef = { id: "curse", name: "Curse", cost: 0, coin: 0, vp: -1, kind: "curse" };

const KINGDOM_CARDS: readonly CardDef[] = [
  // Cellar — +1 Action, discard any number, draw that many
  { id: "cellar", name: "Cellar", cost: 2, coin: 0, vp: 0, kind: "action", plusActions: 1, special: "cellar" },
  // Moat — +2 Cards (reaction omitted: no attacks in this build)
  { id: "moat", name: "Moat", cost: 2, coin: 0, vp: 0, kind: "action", plusCards: 2 },
  // Village — +1 Card, +2 Actions
  { id: "village", name: "Village", cost: 3, coin: 0, vp: 0, kind: "action", plusCards: 1, plusActions: 2 },
  // Workshop — Gain a card costing up to 4 coins
  { id: "workshop", name: "Workshop", cost: 3, coin: 0, vp: 0, kind: "action", special: "workshop" },
  // Smithy — +3 Cards
  { id: "smithy", name: "Smithy", cost: 4, coin: 0, vp: 0, kind: "action", plusCards: 3 },
  // Festival — +2 Actions, +1 Buy, +2 Coin
  { id: "festival", name: "Festival", cost: 5, coin: 0, vp: 0, kind: "action", plusActions: 2, plusBuys: 1, plusCoin: 2 },
  // Laboratory — +2 Cards, +1 Action
  { id: "laboratory", name: "Laboratory", cost: 5, coin: 0, vp: 0, kind: "action", plusCards: 2, plusActions: 1 },
  // Market — +1 Card, +1 Action, +1 Buy, +1 Coin
  { id: "market", name: "Market", cost: 5, coin: 0, vp: 0, kind: "action", plusCards: 1, plusActions: 1, plusBuys: 1, plusCoin: 1 },
];

export const ALL_CARDS: readonly CardDef[] = [
  ...TREASURE_CARDS,
  ...VICTORY_CARDS,
  CURSE_CARD,
  ...KINGDOM_CARDS,
];

const CARD_INDEX: Map<string, CardDef> = new Map(ALL_CARDS.map(c => [c.id, c]));

export function cardById(id: string): CardDef {
  const c = CARD_INDEX.get(id);
  if (!c) throw new Error(`Unknown card id: ${id}`);
  return c;
}

// -------------------------------------------------------------------------
// Supply piles
// -------------------------------------------------------------------------

/**
 * Per the rulebook for 2-player: 8 victory cards each pile, 10 curses,
 * Province pile triggers endgame. Kingdom piles are 10 each (or 8 if it's
 * a victory card — none of our kingdoms are).
 */
export function initialSupply(): Record<string, number> {
  return {
    copper: 60,
    silver: 40,
    gold: 30,
    estate: 8,
    duchy: 8,
    province: 8,
    curse: 10,
    cellar: 10,
    moat: 10,
    village: 10,
    workshop: 10,
    smithy: 10,
    festival: 10,
    laboratory: 10,
    market: 10,
  };
}

// -------------------------------------------------------------------------
// State shape
// -------------------------------------------------------------------------

export type Phase = "action" | "buy" | "cleanup" | "done";

export interface PlayerState {
  /** "you" or "cpu1" / "cpu2" */
  id: string;
  isCpu: boolean;
  deck: string[];
  discard: string[];
  hand: string[];
  played: string[];
  actions: number;
  buys: number;
  coin: number;
}

export interface DominionFullState {
  rngSeed: number;
  supply: Record<string, number>;
  players: PlayerState[];
  current: number; // index into players
  phase: Phase;
  /** populated when a Workshop is awaiting a gain pick */
  workshopPending: boolean;
  /** turn log (last few events) */
  log: string[];
  /** kingdom card ids actually in play (in display order) */
  kingdom: string[];
}

// -------------------------------------------------------------------------
// Actions
// -------------------------------------------------------------------------

export type DominionFullAction =
  | { type: "playAction"; cardId: string }
  | { type: "playAllTreasures" }
  | { type: "buy"; cardId: string }
  | { type: "endActionPhase" }
  | { type: "endBuyPhase" }
  | { type: "workshopGain"; cardId: string }
  | { type: "workshopSkip" }
  | { type: "cpuStep" };

// -------------------------------------------------------------------------
// RNG helpers
// -------------------------------------------------------------------------

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function drawCards(p: PlayerState, n: number, rng: () => number): PlayerState {
  let deck = [...p.deck];
  let discard = [...p.discard];
  const drawn: string[] = [];
  for (let i = 0; i < n; i++) {
    if (deck.length === 0) {
      if (discard.length === 0) break;
      deck = shuffle(discard, rng);
      discard = [];
    }
    drawn.push(deck.shift()!);
  }
  return { ...p, deck, discard, hand: [...p.hand, ...drawn] };
}

// -------------------------------------------------------------------------
// Setup
// -------------------------------------------------------------------------

const STARTING_DECK: string[] = [
  "copper", "copper", "copper", "copper", "copper", "copper", "copper",
  "estate", "estate", "estate",
];

function makePlayer(id: string, isCpu: boolean, rng: () => number): PlayerState {
  const shuffled = shuffle(STARTING_DECK, rng);
  const base: PlayerState = {
    id,
    isCpu,
    deck: shuffled,
    discard: [],
    hand: [],
    played: [],
    actions: 0,
    buys: 0,
    coin: 0,
  };
  return drawCards(base, HAND_SIZE, rng);
}

export function initialState(seed: number, settings: DominionFullSettings): DominionFullState {
  const rng = mulberry32(seed);
  const cpus = settings.cpuCount === 2 ? 2 : 1;

  // Kingdom is fixed in our build (canonical 8-card set) so setup is fully
  // deterministic regardless of seed — but starting hands ARE seeded.
  const kingdom = KINGDOM_CARDS.map(c => c.id);

  const players: PlayerState[] = [
    makePlayer("you", false, rng),
  ];
  for (let i = 0; i < cpus; i++) {
    players.push(makePlayer(i === 0 ? "cpu1" : "cpu2", true, rng));
  }

  // First player gets 1 action and 1 buy on their first turn.
  players[0] = { ...players[0]!, actions: 1, buys: 1, coin: 0 };

  return {
    rngSeed: Math.floor(rng() * 2 ** 31),
    supply: initialSupply(),
    players,
    current: 0,
    phase: "action",
    workshopPending: false,
    log: ["Game start"],
    kingdom,
  };
}

// -------------------------------------------------------------------------
// Game-end check (3-pile or empty Province)
// -------------------------------------------------------------------------

function checkGameEnd(supply: Record<string, number>): boolean {
  if (supply.province === 0) return true;
  let empties = 0;
  for (const k of Object.keys(supply)) {
    if (supply[k] === 0) empties++;
  }
  return empties >= 3;
}

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

function pushLog(state: DominionFullState, line: string): string[] {
  return [...state.log.slice(-19), line];
}

function currentPlayer(state: DominionFullState): PlayerState {
  return state.players[state.current]!;
}

function replacePlayer(state: DominionFullState, idx: number, p: PlayerState): PlayerState[] {
  const next = [...state.players];
  next[idx] = p;
  return next;
}

// -------------------------------------------------------------------------
// Reducer pieces
// -------------------------------------------------------------------------

function doPlayAction(state: DominionFullState, cardId: string): DominionFullState {
  if (state.phase !== "action") return state;
  if (state.workshopPending) return state;
  const player = currentPlayer(state);
  if (player.actions <= 0) return state;
  const idx = player.hand.indexOf(cardId);
  if (idx < 0) return state;
  const card = cardById(cardId);
  if (card.kind !== "action") return state;

  // Remove from hand, add to played
  const hand = [...player.hand];
  hand.splice(idx, 1);
  const played = [...player.played, cardId];

  let next: PlayerState = {
    ...player,
    hand,
    played,
    actions: player.actions - 1 + (card.plusActions ?? 0),
    coin: player.coin + (card.plusCoin ?? 0),
    buys: player.buys + (card.plusBuys ?? 0),
  };

  const rng = mulberry32(state.rngSeed);
  if (card.plusCards && card.plusCards > 0) {
    next = drawCards(next, card.plusCards, rng);
  }
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const log = pushLog(state, `${player.id} plays ${card.name}`);

  if (card.special === "workshop") {
    return {
      ...state,
      players: replacePlayer(state, state.current, next),
      workshopPending: true,
      rngSeed: nextSeed,
      log,
    };
  }

  // Cellar in this build: we simplify to "+1 Action, +1 Card" so the
  // discard-then-redraw choice is auto-resolved (drop the bottom estate-ish
  // card heuristically). For simplicity: act as +1 Action only (already
  // applied) — no auto-cellar of cards. This is a known simplification.

  return {
    ...state,
    players: replacePlayer(state, state.current, next),
    rngSeed: nextSeed,
    log,
  };
}

function doPlayAllTreasures(state: DominionFullState): DominionFullState {
  if (state.phase !== "action" && state.phase !== "buy") return state;
  if (state.workshopPending) return state;
  const player = currentPlayer(state);
  const treasures = player.hand.filter(id => cardById(id).kind === "treasure");
  if (treasures.length === 0 && state.phase === "buy") return state;
  const hand = player.hand.filter(id => cardById(id).kind !== "treasure");
  const played = [...player.played, ...treasures];
  const coin = treasures.reduce((a, id) => a + cardById(id).coin, player.coin);
  return {
    ...state,
    players: replacePlayer(state, state.current, {
      ...player,
      hand,
      played,
      coin,
    }),
    phase: "buy",
    log: pushLog(state, `${player.id} plays treasures (+${treasures.reduce((a, id) => a + cardById(id).coin, 0)}c)`),
  };
}

function doBuy(state: DominionFullState, cardId: string): DominionFullState {
  if (state.phase !== "buy") return state;
  if (state.workshopPending) return state;
  const player = currentPlayer(state);
  if (player.buys <= 0) return state;
  const card = cardById(cardId);
  if (player.coin < card.cost) return state;
  if ((state.supply[cardId] ?? 0) <= 0) return state;

  const supply = { ...state.supply, [cardId]: state.supply[cardId]! - 1 };
  const next: PlayerState = {
    ...player,
    coin: player.coin - card.cost,
    buys: player.buys - 1,
    discard: [...player.discard, cardId],
  };
  const log = pushLog(state, `${player.id} buys ${card.name}`);
  return {
    ...state,
    supply,
    players: replacePlayer(state, state.current, next),
    log,
  };
}

function doWorkshopGain(state: DominionFullState, cardId: string): DominionFullState {
  if (!state.workshopPending) return state;
  const card = cardById(cardId);
  if (card.cost > 4) return state;
  if ((state.supply[cardId] ?? 0) <= 0) return state;
  const player = currentPlayer(state);
  const supply = { ...state.supply, [cardId]: state.supply[cardId]! - 1 };
  const next: PlayerState = {
    ...player,
    discard: [...player.discard, cardId],
  };
  return {
    ...state,
    supply,
    players: replacePlayer(state, state.current, next),
    workshopPending: false,
    log: pushLog(state, `${player.id} gains ${card.name} (Workshop)`),
  };
}

function doCleanupAndAdvance(state: DominionFullState): DominionFullState {
  const player = currentPlayer(state);
  const rng = mulberry32(state.rngSeed);

  // Cleanup: hand + played -> discard, draw 5
  const discard = [...player.discard, ...player.hand, ...player.played];
  let cleaned: PlayerState = {
    ...player,
    hand: [],
    played: [],
    discard,
    actions: 0,
    buys: 0,
    coin: 0,
  };
  cleaned = drawCards(cleaned, HAND_SIZE, rng);
  let players = replacePlayer(state, state.current, cleaned);

  // Game-end check happens AFTER the player has finished their turn (so the
  // Province they just bought is counted in their deck score).
  if (checkGameEnd(state.supply)) {
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return {
      ...state,
      players,
      phase: "done",
      rngSeed: nextSeed,
      log: pushLog(state, "Game over"),
    };
  }

  // Advance to next player
  const next = (state.current + 1) % players.length;
  // Give them their per-turn allowances
  const nextPlayer = players[next]!;
  players = replacePlayer({ ...state, players }, next, {
    ...nextPlayer,
    actions: 1,
    buys: 1,
    coin: 0,
  });

  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    ...state,
    players,
    current: next,
    phase: "action",
    rngSeed: nextSeed,
    log: pushLog(state, `${nextPlayer.id} begins turn`),
  };
}

function doEndActionPhase(state: DominionFullState): DominionFullState {
  if (state.phase !== "action") return state;
  if (state.workshopPending) return state;
  return { ...state, phase: "buy" };
}

function doEndBuyPhase(state: DominionFullState): DominionFullState {
  if (state.phase !== "buy") return state;
  if (state.workshopPending) return state;
  return doCleanupAndAdvance(state);
}

// -------------------------------------------------------------------------
// CPU strategy: "Big Money"
// -------------------------------------------------------------------------

/**
 * Greedy Big Money:
 *   1. Skip most actions (only auto-play Laboratory/Smithy/Market/Festival/
 *      Village if available, since they're "free" card-cyclers — but the
 *      CPU is happy to skip even those and rush treasure).
 *   2. Play all treasures.
 *   3. Buy priority: Province > Gold > Duchy (if <= 4 Provinces left) >
 *      Silver. Skip everything else.
 */
function cpuTakeStep(state: DominionFullState): DominionFullState {
  if (state.phase === "done") return state;
  const player = currentPlayer(state);
  if (!player.isCpu) return state;

  if (state.workshopPending) {
    // Workshop AI: gain Silver if available, otherwise Estate
    if ((state.supply.silver ?? 0) > 0) return doWorkshopGain(state, "silver");
    return doWorkshopGain(state, "estate");
  }

  if (state.phase === "action") {
    // Big-money: play one "drawing" action if we have actions + a card, else end action phase
    if (player.actions > 0) {
      // prefer the cheapest non-terminal +Action card so we don't stall
      const preferred = ["village", "festival", "laboratory", "market", "smithy", "moat"];
      for (const id of preferred) {
        if (player.hand.includes(id)) {
          return doPlayAction(state, id);
        }
      }
    }
    return doEndActionPhase(state);
  }

  if (state.phase === "buy") {
    // Convert treasures if any still in hand
    if (player.hand.some(id => cardById(id).kind === "treasure")) {
      return doPlayAllTreasures(state);
    }
    if (player.buys > 0) {
      const c = player.coin;
      const provincesLeft = state.supply.province ?? 0;
      if (c >= 8 && provincesLeft > 0) return doBuy(state, "province");
      if (c >= 6 && (state.supply.gold ?? 0) > 0) return doBuy(state, "gold");
      // Late-game Duchy pickup
      if (c >= 5 && provincesLeft <= 4 && (state.supply.duchy ?? 0) > 0) return doBuy(state, "duchy");
      if (c >= 3 && (state.supply.silver ?? 0) > 0) return doBuy(state, "silver");
      // Last-ditch Estate if game-ending and provinces gone
      if (c >= 2 && provincesLeft === 0 && (state.supply.estate ?? 0) > 0) return doBuy(state, "estate");
    }
    return doEndBuyPhase(state);
  }

  return state;
}

// -------------------------------------------------------------------------
// Reducer
// -------------------------------------------------------------------------

export function reducer(state: DominionFullState, action: DominionFullAction): DominionFullState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "playAction":      return doPlayAction(state, action.cardId);
    case "playAllTreasures": return doPlayAllTreasures(state);
    case "buy":             return doBuy(state, action.cardId);
    case "endActionPhase":  return doEndActionPhase(state);
    case "endBuyPhase":     return doEndBuyPhase(state);
    case "workshopGain":    return doWorkshopGain(state, action.cardId);
    case "workshopSkip":    return { ...state, workshopPending: false, log: pushLog(state, "Workshop fizzles") };
    case "cpuStep":         return cpuTakeStep(state);
    default:                return state;
  }
}

// -------------------------------------------------------------------------
// Scoring / terminal
// -------------------------------------------------------------------------

export function playerScore(p: PlayerState): number {
  const all = [...p.deck, ...p.discard, ...p.hand, ...p.played];
  return all.reduce((a, id) => a + cardById(id).vp, 0);
}

export function isTerminal(state: DominionFullState): { score: number } | null {
  if (state.phase !== "done") return null;
  const you = state.players[0]!;
  const youScore = playerScore(you);
  const cpuScores = state.players.slice(1).map(playerScore);
  const bestCpu = cpuScores.length > 0 ? Math.max(...cpuScores) : 0;
  if (youScore > bestCpu) {
    // Win: scale VP for leaderboard
    return { score: Math.max(0, youScore) * 10 };
  }
  if (youScore === bestCpu) {
    // Tie: small consolation
    return { score: Math.max(0, youScore) * 3 };
  }
  // Loss: zero (won't appear on leaderboard per plugin contract guidance)
  return { score: 0 };
}
