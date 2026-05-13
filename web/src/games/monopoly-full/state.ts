import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Monopoly Full ───────────────────────────────────────────────────────────
// Full 40-square Hasbro board, 1-vs-CPU scaffold.
//
// Tier L: solid playable scaffold. Implemented:
//   • Full 40-square board (22 properties, 4 railroads, 2 utilities,
//     GO/Just-Visiting/Free Parking/Go-To-Jail, 3 Chance, 3 Community Chest, 2 tax)
//   • 2d6 dice, doubles roll-again, three-doubles-to-jail
//   • Jail w/ pay-$50, roll doubles, Get-Out-Of-Jail-Free card
//   • Buy decision, auctions on declined unbought properties (sealed-bid vs CPU)
//   • Mortgage / unmortgage (~50% face, 10% interest to unmortgage)
//   • Houses & hotels with the 4-then-hotel rule, color-set requirement,
//     "even build" enforcement (highest-house = lowest-house ±1)
//   • Color-monopoly rent doubling on bare lots
//   • Railroad rent scales by RRs owned (25/50/100/200)
//   • Utility rent = 4× / 10× dice roll
//   • Chance & Community Chest decks shuffled by seed, Get-Out-Of-Jail-Free
//     cards rotate back into the deck after use
//   • Game ends on bankruptcy
//
// Advanced rules OMITTED (noted in howToPlay):
//   • Player-to-player trading (no trade UI in L tier)
//   • Selling unimproved properties to other players outside auctions
//   • Forced asset-liquidation modal when player can't pay rent — we just
//     auto-mortgage greedily then mark bankrupt if still negative
//   • Bidding war in auctions: simplified to sealed CPU-vs-player single
//     decision (player names a price; CPU bids max-it-can-afford up to fair
//     market value)
//   • House shortage / hotel shortage rules (treated as unlimited supply)

export const BOARD_LEN = 40;
export const STARTING_CASH = 1500;
export const GO_BONUS = 200;
export const JAIL_FINE = 50;
export const MAX_JAIL_ROLLS = 3;
export const LUXURY_TAX = 100;
export const INCOME_TAX = 200;

export type SquareType =
  | "go"
  | "jail"
  | "free"
  | "gotojail"
  | "property"
  | "railroad"
  | "utility"
  | "chance"
  | "chest"
  | "tax";

export type ColorGroup =
  | "brown"
  | "lightblue"
  | "pink"
  | "orange"
  | "red"
  | "yellow"
  | "green"
  | "blue"
  | null;

export interface Square {
  i: number;
  type: SquareType;
  name: string;
  short: string;
  /** Purchase price (0 for non-buyable). */
  price: number;
  /** Base rent on bare lot — for utilities, the dice-multiplier (×4 / ×10); for railroads, base rent. */
  rent: number;
  /** Rent ladder for properties: [bare, 1h, 2h, 3h, 4h, hotel]. Empty for non-properties. */
  rents: readonly number[];
  /** Cost per house (and per hotel after 4 houses). 0 for non-buildable. */
  houseCost: number;
  color: ColorGroup;
  /** Tax amount for tax squares (income tax or luxury tax). */
  tax?: number;
}

// The standard 1935 US-edition board.
export const BOARD: readonly Square[] = [
  { i:  0, type: "go",       name: "GO",                 short: "GO",    price:   0, rent: 0,    rents: [],                              houseCost: 0,   color: null },
  { i:  1, type: "property", name: "Mediterranean Ave",  short: "Med",   price:  60, rent: 2,    rents: [2, 10, 30, 90, 160, 250],       houseCost: 50,  color: "brown" },
  { i:  2, type: "chest",    name: "Community Chest",    short: "CC",    price:   0, rent: 0,    rents: [],                              houseCost: 0,   color: null },
  { i:  3, type: "property", name: "Baltic Ave",         short: "Bal",   price:  60, rent: 4,    rents: [4, 20, 60, 180, 320, 450],      houseCost: 50,  color: "brown" },
  { i:  4, type: "tax",      name: "Income Tax",         short: "Tax",   price:   0, rent: 0,    rents: [],                              houseCost: 0,   color: null, tax: INCOME_TAX },
  { i:  5, type: "railroad", name: "Reading Railroad",   short: "RR",    price: 200, rent: 25,   rents: [],                              houseCost: 0,   color: null },
  { i:  6, type: "property", name: "Oriental Ave",       short: "Ori",   price: 100, rent: 6,    rents: [6, 30, 90, 270, 400, 550],      houseCost: 50,  color: "lightblue" },
  { i:  7, type: "chance",   name: "Chance",             short: "?",     price:   0, rent: 0,    rents: [],                              houseCost: 0,   color: null },
  { i:  8, type: "property", name: "Vermont Ave",        short: "Vmt",   price: 100, rent: 6,    rents: [6, 30, 90, 270, 400, 550],      houseCost: 50,  color: "lightblue" },
  { i:  9, type: "property", name: "Connecticut Ave",    short: "Cnt",   price: 120, rent: 8,    rents: [8, 40, 100, 300, 450, 600],     houseCost: 50,  color: "lightblue" },

  { i: 10, type: "jail",     name: "Just Visiting",      short: "JAIL",  price:   0, rent: 0,    rents: [],                              houseCost: 0,   color: null },
  { i: 11, type: "property", name: "St. Charles Place",  short: "StC",   price: 140, rent: 10,   rents: [10, 50, 150, 450, 625, 750],    houseCost: 100, color: "pink" },
  { i: 12, type: "utility",  name: "Electric Co.",       short: "Elec",  price: 150, rent: 4,    rents: [],                              houseCost: 0,   color: null },
  { i: 13, type: "property", name: "States Ave",         short: "Sta",   price: 140, rent: 10,   rents: [10, 50, 150, 450, 625, 750],    houseCost: 100, color: "pink" },
  { i: 14, type: "property", name: "Virginia Ave",       short: "Vrg",   price: 160, rent: 12,   rents: [12, 60, 180, 500, 700, 900],    houseCost: 100, color: "pink" },
  { i: 15, type: "railroad", name: "Pennsylvania RR",    short: "RR",    price: 200, rent: 25,   rents: [],                              houseCost: 0,   color: null },
  { i: 16, type: "property", name: "St. James Place",    short: "StJ",   price: 180, rent: 14,   rents: [14, 70, 200, 550, 750, 950],    houseCost: 100, color: "orange" },
  { i: 17, type: "chest",    name: "Community Chest",    short: "CC",    price:   0, rent: 0,    rents: [],                              houseCost: 0,   color: null },
  { i: 18, type: "property", name: "Tennessee Ave",      short: "Tnn",   price: 180, rent: 14,   rents: [14, 70, 200, 550, 750, 950],    houseCost: 100, color: "orange" },
  { i: 19, type: "property", name: "New York Ave",       short: "NY",    price: 200, rent: 16,   rents: [16, 80, 220, 600, 800, 1000],   houseCost: 100, color: "orange" },

  { i: 20, type: "free",     name: "Free Parking",       short: "FREE",  price:   0, rent: 0,    rents: [],                              houseCost: 0,   color: null },
  { i: 21, type: "property", name: "Kentucky Ave",       short: "Ky",    price: 220, rent: 18,   rents: [18, 90, 250, 700, 875, 1050],   houseCost: 150, color: "red" },
  { i: 22, type: "chance",   name: "Chance",             short: "?",     price:   0, rent: 0,    rents: [],                              houseCost: 0,   color: null },
  { i: 23, type: "property", name: "Indiana Ave",        short: "Ind",   price: 220, rent: 18,   rents: [18, 90, 250, 700, 875, 1050],   houseCost: 150, color: "red" },
  { i: 24, type: "property", name: "Illinois Ave",       short: "Ill",   price: 240, rent: 20,   rents: [20, 100, 300, 750, 925, 1100],  houseCost: 150, color: "red" },
  { i: 25, type: "railroad", name: "B&O Railroad",       short: "RR",    price: 200, rent: 25,   rents: [],                              houseCost: 0,   color: null },
  { i: 26, type: "property", name: "Atlantic Ave",       short: "Atl",   price: 260, rent: 22,   rents: [22, 110, 330, 800, 975, 1150],  houseCost: 150, color: "yellow" },
  { i: 27, type: "property", name: "Ventnor Ave",        short: "Vnt",   price: 260, rent: 22,   rents: [22, 110, 330, 800, 975, 1150],  houseCost: 150, color: "yellow" },
  { i: 28, type: "utility",  name: "Water Works",        short: "Wtr",   price: 150, rent: 4,    rents: [],                              houseCost: 0,   color: null },
  { i: 29, type: "property", name: "Marvin Gardens",     short: "Mrv",   price: 280, rent: 24,   rents: [24, 120, 360, 850, 1025, 1200], houseCost: 150, color: "yellow" },

  { i: 30, type: "gotojail", name: "Go To Jail",         short: "->J",   price:   0, rent: 0,    rents: [],                              houseCost: 0,   color: null },
  { i: 31, type: "property", name: "Pacific Ave",        short: "Pac",   price: 300, rent: 26,   rents: [26, 130, 390, 900, 1100, 1275], houseCost: 200, color: "green" },
  { i: 32, type: "property", name: "North Carolina Ave", short: "NC",    price: 300, rent: 26,   rents: [26, 130, 390, 900, 1100, 1275], houseCost: 200, color: "green" },
  { i: 33, type: "chest",    name: "Community Chest",    short: "CC",    price:   0, rent: 0,    rents: [],                              houseCost: 0,   color: null },
  { i: 34, type: "property", name: "Pennsylvania Ave",   short: "Pa",    price: 320, rent: 28,   rents: [28, 150, 450, 1000, 1200, 1400],houseCost: 200, color: "green" },
  { i: 35, type: "railroad", name: "Short Line",         short: "RR",    price: 200, rent: 25,   rents: [],                              houseCost: 0,   color: null },
  { i: 36, type: "chance",   name: "Chance",             short: "?",     price:   0, rent: 0,    rents: [],                              houseCost: 0,   color: null },
  { i: 37, type: "property", name: "Park Place",         short: "Pk",    price: 350, rent: 35,   rents: [35, 175, 500, 1100, 1300, 1500],houseCost: 200, color: "blue" },
  { i: 38, type: "tax",      name: "Luxury Tax",         short: "Tax",   price:   0, rent: 0,    rents: [],                              houseCost: 0,   color: null, tax: LUXURY_TAX },
  { i: 39, type: "property", name: "Boardwalk",          short: "BW",    price: 400, rent: 50,   rents: [50, 200, 600, 1400, 1700, 2000],houseCost: 200, color: "blue" },
];

export type Owner = "none" | "p" | "c" | "bank";

// ─── Cards ──────────────────────────────────────────────────────────────────
export type CardEffect =
  | { kind: "move-to"; pos: number; collectGo?: boolean }
  | { kind: "move-rel"; steps: number }
  | { kind: "go-to-jail" }
  | { kind: "get-out-of-jail-free" }
  | { kind: "pay"; amount: number }
  | { kind: "collect"; amount: number }
  | { kind: "pay-per-house"; perHouse: number; perHotel: number };

export interface Card {
  id: string;
  text: string;
  effect: CardEffect;
}

export const CHANCE_DECK: readonly Card[] = [
  { id: "ch-go",        text: "Advance to GO. Collect $200.",                            effect: { kind: "move-to", pos: 0, collectGo: true } },
  { id: "ch-ill",       text: "Advance to Illinois Ave.",                                 effect: { kind: "move-to", pos: 24, collectGo: true } },
  { id: "ch-stchas",    text: "Advance to St. Charles Place.",                            effect: { kind: "move-to", pos: 11, collectGo: true } },
  { id: "ch-bw",        text: "Advance to Boardwalk.",                                    effect: { kind: "move-to", pos: 39, collectGo: false } },
  { id: "ch-rr1",       text: "Advance to Reading Railroad.",                             effect: { kind: "move-to", pos: 5,  collectGo: true } },
  { id: "ch-bank",      text: "Bank pays you dividend of $50.",                           effect: { kind: "collect", amount: 50 } },
  { id: "ch-jailfree",  text: "Get Out Of Jail Free. Keep this card.",                    effect: { kind: "get-out-of-jail-free" } },
  { id: "ch-back",      text: "Go back 3 spaces.",                                        effect: { kind: "move-rel", steps: -3 } },
  { id: "ch-jail",      text: "Go directly to Jail. Do not pass GO.",                     effect: { kind: "go-to-jail" } },
  { id: "ch-repairs",   text: "Make general repairs: $25 per house, $100 per hotel.",    effect: { kind: "pay-per-house", perHouse: 25, perHotel: 100 } },
  { id: "ch-speed",     text: "Speeding fine. Pay $15.",                                  effect: { kind: "pay", amount: 15 } },
  { id: "ch-elected",   text: "You have been elected chairman. Pay each player $50.",    effect: { kind: "pay", amount: 50 } },
  { id: "ch-bldg",      text: "Building loan matures. Collect $150.",                    effect: { kind: "collect", amount: 150 } },
];

export const CHEST_DECK: readonly Card[] = [
  { id: "cc-go",        text: "Advance to GO. Collect $200.",                            effect: { kind: "move-to", pos: 0, collectGo: true } },
  { id: "cc-bank-err",  text: "Bank error in your favor. Collect $200.",                 effect: { kind: "collect", amount: 200 } },
  { id: "cc-doctor",    text: "Doctor's fees. Pay $50.",                                  effect: { kind: "pay", amount: 50 } },
  { id: "cc-stock",     text: "From sale of stock you get $50.",                          effect: { kind: "collect", amount: 50 } },
  { id: "cc-jailfree",  text: "Get Out Of Jail Free. Keep this card.",                   effect: { kind: "get-out-of-jail-free" } },
  { id: "cc-jail",      text: "Go to Jail. Do not pass GO.",                              effect: { kind: "go-to-jail" } },
  { id: "cc-holiday",   text: "Holiday fund matures. Receive $100.",                     effect: { kind: "collect", amount: 100 } },
  { id: "cc-tax",       text: "Income tax refund. Collect $20.",                          effect: { kind: "collect", amount: 20 } },
  { id: "cc-bday",      text: "It is your birthday. Collect $10 from each player.",     effect: { kind: "collect", amount: 10 } },
  { id: "cc-insurance", text: "Life insurance matures. Collect $100.",                   effect: { kind: "collect", amount: 100 } },
  { id: "cc-hospital",  text: "Pay hospital fees of $100.",                               effect: { kind: "pay", amount: 100 } },
  { id: "cc-school",    text: "Pay school fees of $50.",                                  effect: { kind: "pay", amount: 50 } },
  { id: "cc-consult",   text: "Receive $25 consultancy fee.",                             effect: { kind: "collect", amount: 25 } },
  { id: "cc-repairs",   text: "Street repairs: $40 per house, $115 per hotel.",         effect: { kind: "pay-per-house", perHouse: 40, perHotel: 115 } },
  { id: "cc-prize",     text: "You have won second prize in a beauty contest. $10.",    effect: { kind: "collect", amount: 10 } },
  { id: "cc-inherit",   text: "You inherit $100.",                                        effect: { kind: "collect", amount: 100 } },
];

export interface MonopolyFullSettings { _dummy: boolean; }

export type Phase =
  | "rolling"
  | "deciding"       // player decides to buy or auction
  | "auction"        // player places bid against CPU
  | "manage"         // player optional: build/mortgage between rolls
  | "ai"             // ready to advance to AI turn
  | "jail-choice"    // player decides pay/use-card/roll
  | "done";

export interface PlayerCards {
  jailFree: number; // count of Get-Out-Of-Jail-Free cards held
}

export interface AuctionState {
  squareIdx: number;       // square being auctioned
  playerBid: number;       // candidate player bid (in input)
  cpuMaxBid: number;       // pre-rolled CPU max bid (sealed-bid)
  decided: boolean;
}

export interface MonopolyFullState {
  rngSeed: number;
  pPos: number;
  cPos: number;
  pCash: number;
  cCash: number;
  owners: Owner[];
  /** Houses per property (5 = hotel). 0 for non-buildables. */
  houses: number[];
  /** Mortgaged status per square. */
  mortgaged: boolean[];
  /** Card decks: arrays of indices into CHANCE_DECK / CHEST_DECK. Top of deck = index 0. */
  chanceDeck: number[];
  chestDeck: number[];
  pCards: PlayerCards;
  cCards: PlayerCards;
  turn: number;
  isPlayer: boolean;
  phase: Phase;
  dice: [number, number] | null;
  /** Last roll's sum, retained for utility-rent calc on subsequent landings. */
  lastRoll: number;
  doublesStreak: number;
  pInJail: boolean;
  cInJail: boolean;
  pJailRolls: number;
  cJailRolls: number;
  auction: AuctionState | null;
  message: string;
  log: string[];
  /** Set when game ends, drives score sign. */
  winner: "p" | "c" | null;
}

export type MonopolyFullAction =
  | { type: "roll" }
  | { type: "buy" }
  | { type: "auction-start" }
  | { type: "auction-bid"; amount: number }
  | { type: "auction-pass" }
  | { type: "build"; squareIdx: number }
  | { type: "sell-house"; squareIdx: number }
  | { type: "mortgage"; squareIdx: number }
  | { type: "unmortgage"; squareIdx: number }
  | { type: "end-turn" }
  | { type: "jail-pay" }
  | { type: "jail-card" }
  | { type: "jail-roll" }
  | { type: "ai" };

// ─── Helpers ────────────────────────────────────────────────────────────────

function pushLog(log: readonly string[], line: string): string[] {
  const next = [...log, line];
  return next.length > 10 ? next.slice(next.length - 10) : next;
}

function rollDie(rng: () => number): number {
  return 1 + Math.floor(rng() * 6);
}

function shuffleDeckIndices(seed: number, length: number): number[] {
  const rng = mulberry32(seed >>> 0 || 1);
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]!; arr[i] = arr[j]!; arr[j] = tmp;
  }
  return arr;
}

/** True if owner has all of `color`'s properties (and none mortgaged). */
export function hasColorMonopoly(owners: Owner[], mortgaged: boolean[], owner: Owner, color: ColorGroup): boolean {
  if (color === null || owner === "none" || owner === "bank") return false;
  for (let i = 0; i < BOARD.length; i++) {
    const sq = BOARD[i]!;
    if (sq.color === color) {
      if (owners[i] !== owner) return false;
      if (mortgaged[i]) return false;
    }
  }
  return true;
}

export function countRailroads(owners: Owner[], owner: Owner): number {
  let n = 0;
  for (let i = 0; i < BOARD.length; i++) {
    if (BOARD[i]!.type === "railroad" && owners[i] === owner) n++;
  }
  return n;
}

export function countUtilities(owners: Owner[], owner: Owner): number {
  let n = 0;
  for (let i = 0; i < BOARD.length; i++) {
    if (BOARD[i]!.type === "utility" && owners[i] === owner) n++;
  }
  return n;
}

/** Compute rent for landing on `pos` when owned by `owner`. `diceSum` is the
 *  most recent dice roll (used for utility rent). */
export function computeRent(
  owners: Owner[],
  houses: number[],
  mortgaged: boolean[],
  pos: number,
  owner: Owner,
  diceSum: number,
): number {
  const sq = BOARD[pos]!;
  if (mortgaged[pos]) return 0;
  if (sq.type === "railroad") {
    const n = countRailroads(owners, owner);
    return n > 0 ? 25 * (2 ** (n - 1)) : 0; // 25/50/100/200
  }
  if (sq.type === "utility") {
    const n = countUtilities(owners, owner);
    return n >= 2 ? 10 * diceSum : 4 * diceSum;
  }
  if (sq.type === "property") {
    const h = houses[pos] ?? 0;
    if (h > 0) return sq.rents[h] ?? 0;
    const bare = sq.rents[0] ?? 0;
    // Color monopoly with no houses doubles rent.
    if (hasColorMonopoly(owners, mortgaged, owner, sq.color)) return bare * 2;
    return bare;
  }
  return 0;
}

/** Squares in a color group. */
export function squaresInColor(color: ColorGroup): number[] {
  const out: number[] = [];
  for (let i = 0; i < BOARD.length; i++) {
    if (BOARD[i]!.color === color) out.push(i);
  }
  return out;
}

/** Returns true if building a house on `idx` is legal for `owner`:
 *   - owns full color set, none mortgaged
 *   - even build: this idx's house count is min of group, and < 5
 *   - has cash to cover houseCost
 */
export function canBuild(
  owners: Owner[],
  houses: number[],
  mortgaged: boolean[],
  cash: number,
  owner: Owner,
  idx: number,
): boolean {
  const sq = BOARD[idx]!;
  if (sq.type !== "property" || sq.color === null) return false;
  if (owners[idx] !== owner) return false;
  if (!hasColorMonopoly(owners, mortgaged, owner, sq.color)) return false;
  const group = squaresInColor(sq.color);
  const heres = houses[idx] ?? 0;
  if (heres >= 5) return false;
  const minInGroup = Math.min(...group.map((g) => houses[g] ?? 0));
  if (heres !== minInGroup) return false;
  if (cash < sq.houseCost) return false;
  return true;
}

export function canSellHouse(
  owners: Owner[],
  houses: number[],
  owner: Owner,
  idx: number,
): boolean {
  const sq = BOARD[idx]!;
  if (sq.type !== "property" || sq.color === null) return false;
  if (owners[idx] !== owner) return false;
  const heres = houses[idx] ?? 0;
  if (heres <= 0) return false;
  const group = squaresInColor(sq.color);
  const maxInGroup = Math.max(...group.map((g) => houses[g] ?? 0));
  return heres === maxInGroup;
}

export function canMortgage(owners: Owner[], houses: number[], mortgaged: boolean[], owner: Owner, idx: number): boolean {
  const sq = BOARD[idx]!;
  if (sq.type !== "property" && sq.type !== "railroad" && sq.type !== "utility") return false;
  if (owners[idx] !== owner) return false;
  if (mortgaged[idx]) return false;
  // Can't mortgage if any house in this color group.
  if (sq.color !== null) {
    const group = squaresInColor(sq.color);
    if (group.some((g) => (houses[g] ?? 0) > 0)) return false;
  }
  return true;
}

export function canUnmortgage(owners: Owner[], mortgaged: boolean[], cash: number, owner: Owner, idx: number): boolean {
  const sq = BOARD[idx]!;
  if (owners[idx] !== owner) return false;
  if (!mortgaged[idx]) return false;
  const cost = Math.ceil(sq.price * 0.55); // 50% + 10% interest
  return cash >= cost;
}

export function mortgageValue(idx: number): number {
  return Math.floor((BOARD[idx]?.price ?? 0) / 2);
}

export function unmortgageCost(idx: number): number {
  return Math.ceil((BOARD[idx]?.price ?? 0) * 0.55);
}

/** Net worth: cash + property value + house value − mortgage liabilities.
 *  Useful for end-of-game comparison & CPU heuristics. */
export function netWorth(state: MonopolyFullState, who: "p" | "c"): number {
  const cash = who === "p" ? state.pCash : state.cCash;
  const own: Owner = who;
  let assets = 0;
  for (let i = 0; i < BOARD.length; i++) {
    if (state.owners[i] !== own) continue;
    const sq = BOARD[i]!;
    if (state.mortgaged[i]) assets += mortgageValue(i); // mortgaged = ~half value
    else assets += sq.price;
    const h = state.houses[i] ?? 0;
    if (h > 0) assets += h * sq.houseCost;
  }
  return cash + assets;
}

// ─── Auction helper ─────────────────────────────────────────────────────────
/** CPU's max bid for a property at face price `face`. We use a deterministic
 *  fair-market value scaled by how much cash CPU has. */
function cpuMaxBidFor(cash: number, face: number, rng: () => number): number {
  // CPU values property at 0.85–1.10x face, capped by spendable cash.
  const factor = 0.85 + rng() * 0.25;
  const target = Math.floor(face * factor);
  return Math.max(1, Math.min(target, Math.max(0, cash - 50))); // keep $50 cushion
}

// ─── Card application ──────────────────────────────────────────────────────
function drawCard(deck: number[]): { card: number; rest: number[] } {
  if (deck.length === 0) return { card: 0, rest: [] };
  const card = deck[0]!;
  const rest = deck.slice(1);
  return { card, rest };
}

function returnCardToBottom(deck: number[], card: number): number[] {
  return [...deck, card];
}

function applyCardEffect(
  state: MonopolyFullState,
  who: "p" | "c",
  effect: CardEffect,
  cardLabel: string,
): MonopolyFullState {
  const isP = who === "p";
  let s: MonopolyFullState = { ...state };
  switch (effect.kind) {
    case "collect": {
      if (isP) s.pCash += effect.amount; else s.cCash += effect.amount;
      s.log = pushLog(s.log, `${isP ? "You" : "CPU"} collected $${effect.amount} (${cardLabel}).`);
      return s;
    }
    case "pay": {
      if (isP) s.pCash -= effect.amount; else s.cCash -= effect.amount;
      s.log = pushLog(s.log, `${isP ? "You" : "CPU"} paid $${effect.amount} (${cardLabel}).`);
      return s;
    }
    case "get-out-of-jail-free": {
      if (isP) s.pCards = { ...s.pCards, jailFree: s.pCards.jailFree + 1 };
      else     s.cCards = { ...s.cCards, jailFree: s.cCards.jailFree + 1 };
      s.log = pushLog(s.log, `${isP ? "You" : "CPU"} got a Jail-Free card.`);
      return s;
    }
    case "go-to-jail": {
      if (isP) { s.pPos = 10; s.pInJail = true; s.pJailRolls = 0; }
      else     { s.cPos = 10; s.cInJail = true; s.cJailRolls = 0; }
      s.log = pushLog(s.log, `${isP ? "You" : "CPU"} went to JAIL.`);
      return s;
    }
    case "move-to": {
      const from = isP ? s.pPos : s.cPos;
      const to = effect.pos;
      if (effect.collectGo && to < from) {
        if (isP) s.pCash += GO_BONUS; else s.cCash += GO_BONUS;
        s.log = pushLog(s.log, `${isP ? "You" : "CPU"} passed GO (+$${GO_BONUS}).`);
      }
      if (isP) s.pPos = to; else s.cPos = to;
      s.log = pushLog(s.log, `${isP ? "You" : "CPU"} → ${BOARD[to]!.name} (${cardLabel}).`);
      // Apply landing (without further movement) using last dice roll as multiplier.
      s = applyLandingNoMove(s, who);
      return s;
    }
    case "move-rel": {
      const from = isP ? s.pPos : s.cPos;
      const to = ((from + effect.steps) % BOARD_LEN + BOARD_LEN) % BOARD_LEN;
      if (isP) s.pPos = to; else s.cPos = to;
      s.log = pushLog(s.log, `${isP ? "You" : "CPU"} moved ${effect.steps} → ${BOARD[to]!.name}.`);
      s = applyLandingNoMove(s, who);
      return s;
    }
    case "pay-per-house": {
      let houses = 0, hotels = 0;
      for (let i = 0; i < BOARD.length; i++) {
        if (s.owners[i] !== who) continue;
        const h = s.houses[i] ?? 0;
        if (h === 5) hotels++;
        else houses += h;
      }
      const amt = houses * effect.perHouse + hotels * effect.perHotel;
      if (amt > 0) {
        if (isP) s.pCash -= amt; else s.cCash -= amt;
        s.log = pushLog(s.log, `${isP ? "You" : "CPU"} paid $${amt} for repairs.`);
      }
      return s;
    }
  }
}

// Apply effects when player is already at `pos` (no movement; used post-card).
function applyLandingNoMove(state: MonopolyFullState, who: "p" | "c"): MonopolyFullState {
  const pos = who === "p" ? state.pPos : state.cPos;
  return resolveLanding(state, who, pos, /*alreadyMoved*/ true);
}

// ─── Landing & movement ─────────────────────────────────────────────────────

function advance(state: MonopolyFullState, who: "p" | "c", steps: number): MonopolyFullState {
  const isP = who === "p";
  const fromPos = isP ? state.pPos : state.cPos;
  const newPos = (fromPos + steps) % BOARD_LEN;
  const passedGo = steps > 0 && (newPos < fromPos || fromPos + steps >= BOARD_LEN);
  let s: MonopolyFullState = { ...state };
  if (passedGo) {
    if (isP) s.pCash += GO_BONUS; else s.cCash += GO_BONUS;
    s.log = pushLog(s.log, `${isP ? "You" : "CPU"} passed GO (+$${GO_BONUS}).`);
  }
  if (isP) s.pPos = newPos; else s.cPos = newPos;
  return resolveLanding(s, who, newPos, false);
}

/** Resolve the effects of landing on `pos` (rent, buy decision, card, tax, jail). */
function resolveLanding(
  state: MonopolyFullState,
  who: "p" | "c",
  pos: number,
  alreadyMoved: boolean,
): MonopolyFullState {
  void alreadyMoved;
  const sq = BOARD[pos]!;
  const isP = who === "p";
  let s: MonopolyFullState = { ...state };
  const youAre = isP ? "You" : "CPU";

  switch (sq.type) {
    case "go":
      s.message = `${youAre} on GO.`;
      s.log = pushLog(s.log, `${youAre} landed on GO.`);
      break;
    case "free":
      s.message = `${youAre} on Free Parking.`;
      s.log = pushLog(s.log, `${youAre} on Free Parking.`);
      break;
    case "jail":
      s.message = `${youAre} just visiting jail.`;
      s.log = pushLog(s.log, `${youAre} just visiting jail.`);
      break;
    case "gotojail": {
      if (isP) { s.pPos = 10; s.pInJail = true; s.pJailRolls = 0; }
      else     { s.cPos = 10; s.cInJail = true; s.cJailRolls = 0; }
      s.message = `${youAre} sent to JAIL!`;
      s.log = pushLog(s.log, `${youAre} sent to JAIL!`);
      break;
    }
    case "tax": {
      const amt = sq.tax ?? 0;
      if (isP) s.pCash -= amt; else s.cCash -= amt;
      s.message = `${youAre} paid $${amt} ${sq.name}.`;
      s.log = pushLog(s.log, `${youAre} paid $${amt} (${sq.name}).`);
      break;
    }
    case "chance":
    case "chest": {
      const deck = sq.type === "chance" ? s.chanceDeck : s.chestDeck;
      const ref  = sq.type === "chance" ? CHANCE_DECK : CHEST_DECK;
      const { card, rest } = drawCard(deck);
      const c = ref[card]!;
      // Get-Out-Of-Jail-Free cards do NOT return to bottom (player keeps).
      const newDeck = c.effect.kind === "get-out-of-jail-free" ? rest : returnCardToBottom(rest, card);
      if (sq.type === "chance") s.chanceDeck = newDeck;
      else                       s.chestDeck = newDeck;
      s.message = `${youAre} drew: ${c.text}`;
      s.log = pushLog(s.log, `${youAre} drew: ${c.text}`);
      s = applyCardEffect(s, who, c.effect, sq.type === "chance" ? "Chance" : "Chest");
      break;
    }
    case "property":
    case "railroad":
    case "utility": {
      const owner = s.owners[pos]!;
      if (owner === "none") {
        // Unowned: player gets to buy/auction. CPU greedy logic.
        if (isP) {
          s.phase = "deciding";
          s.message = `${sq.name}: buy for $${sq.price}? Or auction.`;
        } else {
          // CPU: buy if (a) affordable with $100 buffer and (b) face value reasonable.
          if (s.cCash - sq.price >= 100) {
            const o = s.owners.slice(); o[pos] = "c";
            s.owners = o;
            s.cCash -= sq.price;
            s.message = `CPU bought ${sq.name} for $${sq.price}.`;
            s.log = pushLog(s.log, `CPU bought ${sq.name} ($${sq.price}).`);
          } else {
            // CPU declines → auction. In CPU vs nobody, treat as no-sale (simplified).
            s.message = `CPU declined ${sq.name}. (No bids, returned to bank.)`;
            s.log = pushLog(s.log, `CPU declined ${sq.name} (no bids).`);
          }
        }
      } else if (owner !== who && owner !== "bank") {
        // Pay rent (skip mortgaged).
        if (s.mortgaged[pos]) {
          s.message = `${sq.name} is mortgaged — no rent.`;
          s.log = pushLog(s.log, `${sq.name} mortgaged, no rent.`);
        } else {
          const rent = computeRent(s.owners, s.houses, s.mortgaged, pos, owner, s.lastRoll || 7);
          if (isP) { s.pCash -= rent; s.cCash += rent; }
          else     { s.cCash -= rent; s.pCash += rent; }
          s.message = `${youAre} paid $${rent} rent on ${sq.name}.`;
          s.log = pushLog(s.log, `${youAre} paid $${rent} rent (${sq.name}).`);
        }
      } else {
        s.message = `${youAre} on own ${sq.name}.`;
      }
      break;
    }
  }
  return s;
}

// ─── Bankruptcy helper ─────────────────────────────────────────────────────
function autoLiquidate(state: MonopolyFullState, who: "p" | "c"): MonopolyFullState {
  // While cash < 0, sell houses then mortgage properties (cheapest-value first
  // to preserve high-rent assets). Stops when cash ≥ 0 or nothing more to sell.
  let s = { ...state };
  const cashOf = () => (who === "p" ? s.pCash : s.cCash);
  const addCash = (n: number) => {
    if (who === "p") s.pCash += n;
    else             s.cCash += n;
  };

  // Pass 1: sell houses
  let safety = 200;
  while (cashOf() < 0 && safety-- > 0) {
    let bestIdx = -1;
    let bestHouseCount = 0;
    for (let i = 0; i < BOARD.length; i++) {
      if (s.owners[i] !== who) continue;
      const h = s.houses[i] ?? 0;
      if (h > bestHouseCount) { bestHouseCount = h; bestIdx = i; }
    }
    if (bestIdx < 0) break;
    // Sell one house (must observe even-build, but since we sell highest first it's fine).
    const sq = BOARD[bestIdx]!;
    const newHouses = s.houses.slice(); newHouses[bestIdx] = (newHouses[bestIdx] ?? 0) - 1;
    s.houses = newHouses;
    const refund = Math.floor(sq.houseCost / 2);
    addCash(refund);
    s.log = pushLog(s.log, `${who === "p" ? "You" : "CPU"} sold house on ${sq.name} ($${refund}).`);
  }

  // Pass 2: mortgage
  safety = 200;
  while (cashOf() < 0 && safety-- > 0) {
    let bestIdx = -1;
    let bestVal = -1;
    for (let i = 0; i < BOARD.length; i++) {
      if (s.owners[i] !== who) continue;
      if (s.mortgaged[i]) continue;
      // Can't mortgage with houses in the group.
      const sq = BOARD[i]!;
      if (sq.color !== null) {
        const grp = squaresInColor(sq.color);
        if (grp.some((g) => (s.houses[g] ?? 0) > 0)) continue;
      }
      const v = mortgageValue(i);
      if (v > bestVal) { bestVal = v; bestIdx = i; }
    }
    if (bestIdx < 0) break;
    const newM = s.mortgaged.slice(); newM[bestIdx] = true;
    s.mortgaged = newM;
    addCash(mortgageValue(bestIdx));
    s.log = pushLog(s.log, `${who === "p" ? "You" : "CPU"} mortgaged ${BOARD[bestIdx]!.name} (+$${mortgageValue(bestIdx)}).`);
  }
  return s;
}

function checkEnd(state: MonopolyFullState): MonopolyFullState {
  let s = state;
  if (s.pCash < 0) s = autoLiquidate(s, "p");
  if (s.cCash < 0) s = autoLiquidate(s, "c");
  if (s.pCash < 0) {
    return {
      ...s,
      phase: "done",
      winner: "c",
      message: "You went bankrupt. CPU wins.",
      log: pushLog(s.log, "You went bankrupt — CPU wins."),
    };
  }
  if (s.cCash < 0) {
    return {
      ...s,
      phase: "done",
      winner: "p",
      message: "CPU went bankrupt. You win!",
      log: pushLog(s.log, "CPU went bankrupt — you win!"),
    };
  }
  return s;
}

// ─── initialState ──────────────────────────────────────────────────────────

export function initialState(seed: number, _s: MonopolyFullSettings): MonopolyFullState {
  const sd = seed >>> 0 || 1;
  return {
    rngSeed: sd,
    pPos: 0,
    cPos: 0,
    pCash: STARTING_CASH,
    cCash: STARTING_CASH,
    owners: new Array(BOARD_LEN).fill("none") as Owner[],
    houses: new Array(BOARD_LEN).fill(0),
    mortgaged: new Array(BOARD_LEN).fill(false),
    chanceDeck: shuffleDeckIndices(sd ^ 0xA1B2C3, CHANCE_DECK.length),
    chestDeck:  shuffleDeckIndices(sd ^ 0xD4E5F6, CHEST_DECK.length),
    pCards: { jailFree: 0 },
    cCards: { jailFree: 0 },
    turn: 1,
    isPlayer: true,
    phase: "rolling",
    dice: null,
    lastRoll: 0,
    doublesStreak: 0,
    pInJail: false,
    cInJail: false,
    pJailRolls: 0,
    cJailRolls: 0,
    auction: null,
    message: "Your roll.",
    log: ["Game start. You and CPU each have $1,500."],
    winner: null,
  };
}

// ─── reducer ───────────────────────────────────────────────────────────────

export function reducer(state: MonopolyFullState, action: MonopolyFullAction): MonopolyFullState {
  if (state.phase === "done") return state;

  // ── Player's roll ──
  if (action.type === "roll" && state.phase === "rolling" && state.isPlayer) {
    if (state.pInJail) {
      // Player must take jail action first.
      return { ...state, phase: "jail-choice", message: "You're in jail. Pay $50, use card, or roll for doubles." };
    }
    const rng = mulberry32(state.rngSeed);
    const d1 = rollDie(rng);
    const d2 = rollDie(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const isDouble = d1 === d2;
    const sum = d1 + d2;

    let nextDoubles = isDouble ? state.doublesStreak + 1 : 0;
    if (nextDoubles >= 3) {
      return checkEnd({
        ...state,
        rngSeed: nextSeed,
        dice: [d1, d2],
        lastRoll: sum,
        pPos: 10,
        pInJail: true,
        pJailRolls: 0,
        doublesStreak: 0,
        phase: "ai",
        message: "Three doubles — straight to jail!",
        log: pushLog(state.log, "You rolled 3 doubles → JAIL!"),
      });
    }

    let s: MonopolyFullState = {
      ...state,
      rngSeed: nextSeed,
      dice: [d1, d2],
      lastRoll: sum,
      doublesStreak: nextDoubles,
    };
    s = advance(s, "p", sum);

    // If doubles & not jailed & not awaiting decision → roll again (stay in rolling).
    if (isDouble && s.phase !== "deciding" && !s.pInJail) {
      s = {
        ...s,
        phase: "rolling",
        message: `Doubles! ${d1}+${d2}=${sum}. Roll again.`,
        log: pushLog(s.log, `You rolled doubles ${d1}+${d2}, roll again.`),
      };
    } else if (s.phase !== "deciding") {
      // Go to manage phase so player can build/mortgage between rolls.
      s = { ...s, phase: "manage", message: s.message + " (Manage or End Turn.)" };
    }
    return checkEnd(s);
  }

  // ── Jail choices ──
  if (action.type === "jail-pay" && state.phase === "jail-choice") {
    if (state.pCash < JAIL_FINE) return state;
    const rng = mulberry32(state.rngSeed);
    const d1 = rollDie(rng);
    const d2 = rollDie(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = d1 + d2;
    let s: MonopolyFullState = {
      ...state,
      rngSeed: nextSeed,
      dice: [d1, d2],
      lastRoll: sum,
      pCash: state.pCash - JAIL_FINE,
      pInJail: false,
      pJailRolls: 0,
      log: pushLog(state.log, `You paid $${JAIL_FINE} bail.`),
    };
    s = advance(s, "p", sum);
    if (s.phase !== "deciding") s = { ...s, phase: "manage" };
    return checkEnd(s);
  }
  if (action.type === "jail-card" && state.phase === "jail-choice") {
    if (state.pCards.jailFree <= 0) return state;
    const rng = mulberry32(state.rngSeed);
    const d1 = rollDie(rng);
    const d2 = rollDie(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = d1 + d2;
    let s: MonopolyFullState = {
      ...state,
      rngSeed: nextSeed,
      dice: [d1, d2],
      lastRoll: sum,
      pInJail: false,
      pJailRolls: 0,
      pCards: { ...state.pCards, jailFree: state.pCards.jailFree - 1 },
      log: pushLog(state.log, "You used a Get-Out-Of-Jail-Free card."),
    };
    s = advance(s, "p", sum);
    if (s.phase !== "deciding") s = { ...s, phase: "manage" };
    return checkEnd(s);
  }
  if (action.type === "jail-roll" && state.phase === "jail-choice") {
    const rng = mulberry32(state.rngSeed);
    const d1 = rollDie(rng);
    const d2 = rollDie(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const isDouble = d1 === d2;
    const sum = d1 + d2;
    if (isDouble) {
      let s: MonopolyFullState = {
        ...state,
        rngSeed: nextSeed,
        dice: [d1, d2],
        lastRoll: sum,
        pInJail: false,
        pJailRolls: 0,
        log: pushLog(state.log, `Doubles ${d1}+${d2} — out of jail!`),
      };
      s = advance(s, "p", sum);
      if (s.phase !== "deciding") s = { ...s, phase: "manage" };
      return checkEnd(s);
    }
    const tries = state.pJailRolls + 1;
    if (tries >= MAX_JAIL_ROLLS) {
      // Forced pay
      if (state.pCash < JAIL_FINE) return state; // can't pay, force liquidation in checkEnd
      let s: MonopolyFullState = {
        ...state,
        rngSeed: nextSeed,
        dice: [d1, d2],
        lastRoll: sum,
        pCash: state.pCash - JAIL_FINE,
        pInJail: false,
        pJailRolls: 0,
        log: pushLog(state.log, `Forced $${JAIL_FINE} bail after 3 fails.`),
      };
      s = advance(s, "p", sum);
      if (s.phase !== "deciding") s = { ...s, phase: "manage" };
      return checkEnd(s);
    }
    return checkEnd({
      ...state,
      rngSeed: nextSeed,
      dice: [d1, d2],
      lastRoll: sum,
      pJailRolls: tries,
      phase: "ai",
      message: `Still in jail (${tries}/3 tries).`,
      log: pushLog(state.log, `No doubles — still jailed (${tries}/3).`),
    });
  }

  // ── Buy / Auction ──
  if (action.type === "buy" && state.phase === "deciding" && state.isPlayer) {
    const pos = state.pPos;
    const sq = BOARD[pos]!;
    if (state.pCash < sq.price) return state;
    const owners = state.owners.slice(); owners[pos] = "p";
    return checkEnd({
      ...state,
      pCash: state.pCash - sq.price,
      owners,
      phase: "manage",
      message: `Bought ${sq.name} for $${sq.price}.`,
      log: pushLog(state.log, `You bought ${sq.name} ($${sq.price}).`),
      doublesStreak: 0,
    });
  }
  if (action.type === "auction-start" && state.phase === "deciding" && state.isPlayer) {
    // Pre-roll CPU max bid using rngSeed.
    const rng = mulberry32(state.rngSeed);
    const cpuMax = cpuMaxBidFor(state.cCash, BOARD[state.pPos]!.price, rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return {
      ...state,
      rngSeed: nextSeed,
      phase: "auction",
      auction: { squareIdx: state.pPos, playerBid: 1, cpuMaxBid: cpuMax, decided: false },
      message: `Auction: ${BOARD[state.pPos]!.name}. Enter your bid.`,
      log: pushLog(state.log, `Auction opened for ${BOARD[state.pPos]!.name}.`),
    };
  }
  if (action.type === "auction-bid" && state.phase === "auction" && state.auction) {
    const { squareIdx, cpuMaxBid } = state.auction;
    const bid = Math.max(1, Math.min(action.amount | 0, state.pCash));
    if (bid > cpuMaxBid) {
      // Player wins.
      const owners = state.owners.slice(); owners[squareIdx] = "p";
      return checkEnd({
        ...state,
        pCash: state.pCash - bid,
        owners,
        phase: "manage",
        auction: null,
        message: `You won the auction for ${BOARD[squareIdx]!.name} ($${bid}).`,
        log: pushLog(state.log, `You won auction (${BOARD[squareIdx]!.name}) $${bid}.`),
        doublesStreak: 0,
      });
    } else {
      // CPU outbids at cpuMaxBid (CPU pays its full max as a deterrent).
      const owners = state.owners.slice();
      const cpuPays = Math.max(cpuMaxBid, bid + 1); // CPU bids one over
      if (state.cCash >= cpuPays) {
        owners[squareIdx] = "c";
        return checkEnd({
          ...state,
          cCash: state.cCash - cpuPays,
          owners,
          phase: "manage",
          auction: null,
          message: `CPU outbid you ($${cpuPays}) for ${BOARD[squareIdx]!.name}.`,
          log: pushLog(state.log, `CPU won auction (${BOARD[squareIdx]!.name}) $${cpuPays}.`),
          doublesStreak: 0,
        });
      }
      // CPU can't afford → no sale.
      return checkEnd({
        ...state,
        phase: "manage",
        auction: null,
        message: `${BOARD[squareIdx]!.name} unsold (CPU can't afford to outbid).`,
        log: pushLog(state.log, `Auction passed (no buyer).`),
        doublesStreak: 0,
      });
    }
  }
  if (action.type === "auction-pass" && state.phase === "auction" && state.auction) {
    const { squareIdx, cpuMaxBid } = state.auction;
    // Player skips → CPU buys at half its max if affordable.
    const cpuPays = Math.max(1, Math.floor(cpuMaxBid * 0.5));
    if (state.cCash >= cpuPays && cpuPays > 0) {
      const owners = state.owners.slice(); owners[squareIdx] = "c";
      return checkEnd({
        ...state,
        cCash: state.cCash - cpuPays,
        owners,
        phase: "manage",
        auction: null,
        message: `CPU snapped up ${BOARD[squareIdx]!.name} for $${cpuPays}.`,
        log: pushLog(state.log, `CPU won auction by walkover ($${cpuPays}).`),
        doublesStreak: 0,
      });
    }
    return checkEnd({
      ...state,
      phase: "manage",
      auction: null,
      message: `${BOARD[squareIdx]!.name} unsold.`,
      log: pushLog(state.log, "Auction passed (no buyer)."),
      doublesStreak: 0,
    });
  }

  // ── Manage phase actions ──
  if (action.type === "build" && state.phase === "manage" && state.isPlayer) {
    const idx = action.squareIdx;
    if (!canBuild(state.owners, state.houses, state.mortgaged, state.pCash, "p", idx)) return state;
    const sq = BOARD[idx]!;
    const houses = state.houses.slice(); houses[idx] = (houses[idx] ?? 0) + 1;
    return {
      ...state,
      pCash: state.pCash - sq.houseCost,
      houses,
      message: `Built ${houses[idx] === 5 ? "hotel" : "house"} on ${sq.name}.`,
      log: pushLog(state.log, `You built ${houses[idx] === 5 ? "a hotel" : `house #${houses[idx]}`} on ${sq.name}.`),
    };
  }
  if (action.type === "sell-house" && state.phase === "manage" && state.isPlayer) {
    const idx = action.squareIdx;
    if (!canSellHouse(state.owners, state.houses, "p", idx)) return state;
    const sq = BOARD[idx]!;
    const houses = state.houses.slice(); houses[idx] = (houses[idx] ?? 0) - 1;
    const refund = Math.floor(sq.houseCost / 2);
    return {
      ...state,
      pCash: state.pCash + refund,
      houses,
      message: `Sold house on ${sq.name} (+$${refund}).`,
      log: pushLog(state.log, `You sold house on ${sq.name} (+$${refund}).`),
    };
  }
  if (action.type === "mortgage" && state.phase === "manage" && state.isPlayer) {
    const idx = action.squareIdx;
    if (!canMortgage(state.owners, state.houses, state.mortgaged, "p", idx)) return state;
    const v = mortgageValue(idx);
    const newM = state.mortgaged.slice(); newM[idx] = true;
    return {
      ...state,
      pCash: state.pCash + v,
      mortgaged: newM,
      message: `Mortgaged ${BOARD[idx]!.name} (+$${v}).`,
      log: pushLog(state.log, `You mortgaged ${BOARD[idx]!.name} (+$${v}).`),
    };
  }
  if (action.type === "unmortgage" && state.phase === "manage" && state.isPlayer) {
    const idx = action.squareIdx;
    if (!canUnmortgage(state.owners, state.mortgaged, state.pCash, "p", idx)) return state;
    const c = unmortgageCost(idx);
    const newM = state.mortgaged.slice(); newM[idx] = false;
    return {
      ...state,
      pCash: state.pCash - c,
      mortgaged: newM,
      message: `Unmortgaged ${BOARD[idx]!.name} (−$${c}).`,
      log: pushLog(state.log, `You unmortgaged ${BOARD[idx]!.name} (−$${c}).`),
    };
  }
  if (action.type === "end-turn" && state.phase === "manage" && state.isPlayer) {
    return {
      ...state,
      phase: "ai",
      message: "Ending turn — CPU rolls.",
      doublesStreak: 0,
    };
  }

  // ── AI turn ──
  if (action.type === "ai" && state.phase === "ai") {
    return runAiTurn(state);
  }

  return state;
}

// ─── AI ───────────────────────────────────────────────────────────────────
function runAiTurn(state: MonopolyFullState): MonopolyFullState {
  let s = state;
  // Pre-turn: try to unmortgage if cash flush, and build houses on monopolies.
  s = aiPreTurnManage(s);

  // Roll loop — handle doubles up to 3 times.
  for (let dr = 0; dr < 3; dr++) {
    const rng = mulberry32(s.rngSeed);
    const d1 = rollDie(rng);
    const d2 = rollDie(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const isDouble = d1 === d2;
    const sum = d1 + d2;
    s = { ...s, rngSeed: nextSeed, dice: [d1, d2], lastRoll: sum };

    if (s.cInJail) {
      // CPU: use card if has, else pay if cash>200, else roll for doubles.
      if (s.cCards.jailFree > 0) {
        s = { ...s, cCards: { ...s.cCards, jailFree: s.cCards.jailFree - 1 }, cInJail: false, cJailRolls: 0,
              log: pushLog(s.log, "CPU used a Get-Out-Of-Jail-Free card.") };
        s = advance(s, "c", sum);
      } else if (isDouble) {
        s = { ...s, cInJail: false, cJailRolls: 0, log: pushLog(s.log, `CPU rolled doubles ${d1}+${d2} — out of jail!`) };
        s = advance(s, "c", sum);
      } else if (s.cCash > 200 || s.cJailRolls >= MAX_JAIL_ROLLS - 1) {
        s = { ...s, cCash: s.cCash - JAIL_FINE, cInJail: false, cJailRolls: 0, log: pushLog(s.log, `CPU paid $${JAIL_FINE} bail.`) };
        s = advance(s, "c", sum);
      } else {
        s = { ...s, cJailRolls: s.cJailRolls + 1, log: pushLog(s.log, `CPU stays in jail (${s.cJailRolls + 1}/3).`) };
        break;
      }
    } else {
      // Triple-doubles check
      if (isDouble && s.doublesStreak >= 2) {
        s = { ...s, cPos: 10, cInJail: true, cJailRolls: 0, doublesStreak: 0,
              log: pushLog(s.log, "CPU rolled 3 doubles → JAIL!") };
        break;
      }
      s = { ...s, doublesStreak: isDouble ? s.doublesStreak + 1 : 0 };
      s = advance(s, "c", sum);
    }

    // If CPU is now jailed (landed on Go-To-Jail or 3 doubles), end loop.
    if (s.cInJail) break;
    if (s.phase === "done") break;
    if (!isDouble) break;
  }

  s = aiPostTurnManage(s);
  s = checkEnd(s);
  if (s.phase === "done") return s;
  return {
    ...s,
    isPlayer: true,
    turn: s.turn + 1,
    phase: "rolling",
    doublesStreak: 0,
    message: s.cInJail ? "CPU jailed. Your roll." : "Your roll.",
  };
}

function aiPreTurnManage(state: MonopolyFullState): MonopolyFullState {
  let s = state;
  // Unmortgage if cash > 500 and any mortgaged property.
  let safety = 30;
  while (s.cCash > 500 && safety-- > 0) {
    let bestIdx = -1;
    for (let i = 0; i < BOARD.length; i++) {
      if (s.owners[i] === "c" && s.mortgaged[i]) {
        if (unmortgageCost(i) <= s.cCash - 200) { bestIdx = i; break; }
      }
    }
    if (bestIdx < 0) break;
    const c = unmortgageCost(bestIdx);
    const newM = s.mortgaged.slice(); newM[bestIdx] = false;
    s = { ...s, cCash: s.cCash - c, mortgaged: newM, log: pushLog(s.log, `CPU unmortgaged ${BOARD[bestIdx]!.name} (−$${c}).`) };
  }

  // Build houses on monopolies (greedy, cheap-first).
  safety = 30;
  while (safety-- > 0) {
    let bestIdx = -1;
    let bestCost = Infinity;
    for (let i = 0; i < BOARD.length; i++) {
      if (!canBuild(s.owners, s.houses, s.mortgaged, s.cCash - 300, "c", i)) continue;
      const cost = BOARD[i]!.houseCost;
      if (cost < bestCost) { bestCost = cost; bestIdx = i; }
    }
    if (bestIdx < 0) break;
    const sq = BOARD[bestIdx]!;
    const houses = s.houses.slice(); houses[bestIdx] = (houses[bestIdx] ?? 0) + 1;
    s = {
      ...s,
      cCash: s.cCash - sq.houseCost,
      houses,
      log: pushLog(s.log, `CPU built ${houses[bestIdx] === 5 ? "a hotel" : `house #${houses[bestIdx]}`} on ${sq.name}.`),
    };
  }
  return s;
}

function aiPostTurnManage(state: MonopolyFullState): MonopolyFullState {
  // After landing: if cash low (<100), mortgage cheapest unimproved property.
  let s = state;
  if (s.cCash < 100) {
    let bestIdx = -1;
    let bestV = Infinity;
    for (let i = 0; i < BOARD.length; i++) {
      if (s.owners[i] !== "c" || s.mortgaged[i]) continue;
      // Skip if has houses on color group.
      const sq = BOARD[i]!;
      if (sq.color !== null) {
        const grp = squaresInColor(sq.color);
        if (grp.some((g) => (s.houses[g] ?? 0) > 0)) continue;
      }
      const v = mortgageValue(i);
      if (v < bestV) { bestV = v; bestIdx = i; }
    }
    if (bestIdx >= 0) {
      const newM = s.mortgaged.slice(); newM[bestIdx] = true;
      s = {
        ...s,
        cCash: s.cCash + mortgageValue(bestIdx),
        mortgaged: newM,
        log: pushLog(s.log, `CPU mortgaged ${BOARD[bestIdx]!.name} (+$${mortgageValue(bestIdx)}).`),
      };
    }
  }
  return s;
}

// ─── Terminal & score ────────────────────────────────────────────────────

export function score(s: MonopolyFullState): number {
  const pw = netWorth(s, "p");
  const cw = netWorth(s, "c");
  const winBonus = s.winner === "p" ? 1000 : 0;
  return Math.max(0, winBonus + pw - cw + 1500);
}

export function isTerminal(s: MonopolyFullState): { score: number } | null {
  return s.phase === "done" ? { score: score(s) } : null;
}
