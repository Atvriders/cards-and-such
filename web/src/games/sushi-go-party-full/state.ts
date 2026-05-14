import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ---------------------------------------------------------------------------
// Sushi Go Party (full ruleset, single-player vs 3 CPUs)
//
// 4 players, 3 rounds of 9 cards each.
// Each player picks one card from their hand, then passes the remaining hand
// to the next player. Once all 9 cards are picked, the round is scored.
// Maki + Pudding (and special interactions) are scored differently — see
// scoreRound + scoreEnd below.
// ---------------------------------------------------------------------------

export const NUM_PLAYERS = 4;
export const HUMAN_SEAT = 0;
export const HAND_SIZE = 9;
export const TOTAL_ROUNDS = 3;

export type CardKind =
  | "nigiri1"
  | "nigiri2"
  | "nigiri3"
  | "maki1"
  | "maki2"
  | "maki3"
  | "sashimi"
  | "tempura"
  | "dumpling"
  | "pudding"
  | "soy"
  | "wasabi"
  | "tea";

export interface Card {
  id: number;       // unique deterministic id (deck-position-based)
  kind: CardKind;
}

export type Phase =
  | "picking"       // human is selecting from their hand
  | "round-scored" // results shown, awaiting "next round"
  | "done";        // game finished

export interface SushiGoPartyFullState {
  round: number;                  // 1..3
  pickIndex: number;              // 0..8 within the round
  phase: Phase;
  hands: Card[][];                // hands[seat] = remaining hand for that seat
  tableaus: Card[][];             // tableaus[seat] = locked cards this round
  roundScores: number[][];        // [seat] -> per-round scores ([round-1])
  puddings: number[];             // running pudding count per seat (across game)
  totals: number[];               // running totals per seat (does NOT include pudding bonus until done)
  lastRoundLog: string[];         // per-seat scoring summary lines from last completed round
  finalLog: string[];             // pudding bonus log at end of game
  rng: number;                    // current rng state (mulberry32 internal)
}

export type SushiGoPartyFullAction =
  | { type: "pick"; idx: number }
  | { type: "next" };

export interface SushiGoPartyFullSettings { dummy: boolean }

// ---------------------------------------------------------------------------
// Deck composition. We use proportions inspired by Sushi Go Party (a 9-card
// hand for 4 players means we need 4*9 = 36 cards per round, drawn from a
// menu of ~84 cards). We tune the distribution so all card types appear
// frequently enough to make every strategy viable.
// ---------------------------------------------------------------------------
const CARD_COUNTS: Record<CardKind, number> = {
  nigiri1: 8,
  nigiri2: 6,
  nigiri3: 4,
  maki1: 6,
  maki2: 8,
  maki3: 6,
  sashimi: 10,
  tempura: 10,
  dumpling: 10,
  pudding: 8,
  soy: 4,
  wasabi: 4,
  tea: 4,
};

function buildDeck(): CardKind[] {
  const deck: CardKind[] = [];
  for (const k of Object.keys(CARD_COUNTS) as CardKind[]) {
    for (let i = 0; i < CARD_COUNTS[k]; i++) deck.push(k);
  }
  return deck;
}

function shuffle<T>(arr: T[], rngState: { v: number }): T[] {
  // Fisher–Yates using mulberry32 driven from rngState (advances in-place)
  const rng = mulberry32(rngState.v >>> 0);
  // We need the rng to advance our state — sample the first few values and
  // hash them back into rngState.v so consecutive shuffles diverge.
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!; out[i] = out[j]!; out[j] = tmp;
  }
  // advance the state deterministically — re-seed using a few rng draws
  rngState.v = Math.floor(rng() * 0xffffffff) >>> 0;
  return out;
}

function deal(round: number, rngState: { v: number }): Card[][] {
  const deck = shuffle(buildDeck(), rngState);
  const hands: Card[][] = [[], [], [], []];
  let id = round * 10000;
  for (let seat = 0; seat < NUM_PLAYERS; seat++) {
    for (let i = 0; i < HAND_SIZE; i++) {
      const k = deck[seat * HAND_SIZE + i];
      if (!k) continue; // should not happen — deck has 84 cards
      hands[seat]!.push({ id: id++, kind: k });
    }
  }
  return hands;
}

// ---------------------------------------------------------------------------
// Pretty names
// ---------------------------------------------------------------------------
export function cardLabel(kind: CardKind): string {
  switch (kind) {
    case "nigiri1": return "Egg Nigiri";
    case "nigiri2": return "Salmon Nigiri";
    case "nigiri3": return "Squid Nigiri";
    case "maki1": return "Maki ×1";
    case "maki2": return "Maki ×2";
    case "maki3": return "Maki ×3";
    case "sashimi": return "Sashimi";
    case "tempura": return "Tempura";
    case "dumpling": return "Dumpling";
    case "pudding": return "Pudding";
    case "soy": return "Soy Sauce";
    case "wasabi": return "Wasabi";
    case "tea": return "Tea";
  }
}

export function cardShort(kind: CardKind): string {
  switch (kind) {
    case "nigiri1": return "Egg N1";
    case "nigiri2": return "Sal N2";
    case "nigiri3": return "Sqd N3";
    case "maki1": return "M×1";
    case "maki2": return "M×2";
    case "maki3": return "M×3";
    case "sashimi": return "Sash";
    case "tempura": return "Temp";
    case "dumpling": return "Dump";
    case "pudding": return "Pud";
    case "soy": return "Soy";
    case "wasabi": return "Was";
    case "tea": return "Tea";
  }
}

export function cardCategory(kind: CardKind):
  "nigiri" | "maki" | "sashimi" | "tempura" | "dumpling" | "pudding" | "special" {
  if (kind === "nigiri1" || kind === "nigiri2" || kind === "nigiri3") return "nigiri";
  if (kind === "maki1" || kind === "maki2" || kind === "maki3") return "maki";
  if (kind === "sashimi") return "sashimi";
  if (kind === "tempura") return "tempura";
  if (kind === "dumpling") return "dumpling";
  if (kind === "pudding") return "pudding";
  return "special";
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------
const DUMPLING_TIERS = [0, 1, 3, 6, 10, 15];

function nigiriValue(kind: CardKind): number {
  if (kind === "nigiri1") return 1;
  if (kind === "nigiri2") return 2;
  if (kind === "nigiri3") return 3;
  return 0;
}

function makiCount(kind: CardKind): number {
  if (kind === "maki1") return 1;
  if (kind === "maki2") return 2;
  if (kind === "maki3") return 3;
  return 0;
}

export interface RoundScoreBreakdown {
  nigiri: number;
  sashimi: number;
  tempura: number;
  dumpling: number;
  maki: number;
  tea: number;
  total: number;
}

/** Score one player's tableau for one round (excluding pudding — that's deferred to end). */
export function scoreSeatRound(tableau: Card[], makiPoints: number): RoundScoreBreakdown {
  // ---- count categories ----
  let sashimi = 0, tempura = 0, dumpling = 0;
  let soy = 0, wasabiUsed = 0, wasabiAvailable = 0, tea = 0;
  const nigiriList: number[] = []; // base nigiri values (1/2/3) — possibly tripled if wasabi
  // Process cards left-to-right (chronological pick order) so wasabi only
  // applies to the *next* nigiri played after it — classic Sushi Go rule.
  let pendingWasabi = 0;
  for (const c of tableau) {
    switch (c.kind) {
      case "sashimi": sashimi++; break;
      case "tempura": tempura++; break;
      case "dumpling": dumpling++; break;
      case "soy": soy++; break;
      case "tea": tea++; break;
      case "wasabi":
        pendingWasabi++;
        wasabiAvailable++;
        break;
      case "nigiri1":
      case "nigiri2":
      case "nigiri3": {
        const base = nigiriValue(c.kind);
        if (pendingWasabi > 0) {
          nigiriList.push(base * 3);
          pendingWasabi--;
          wasabiUsed++;
        } else {
          nigiriList.push(base);
        }
        break;
      }
      default: break;
    }
  }

  const nigiri = nigiriList.reduce((a, b) => a + b, 0);
  const sashimiScore = Math.floor(sashimi / 3) * 10;
  const tempuraScore = Math.floor(tempura / 2) * 5;
  const dumplingScore = DUMPLING_TIERS[Math.min(dumpling, 5)] ?? 0;

  // Tea: in real Sushi Go Party, tea scores points equal to the number of
  // cards of its dominant type. We use a friendlier simplification: each tea
  // is worth (# of cards in your most-played non-special category) * 1 point.
  let teaScore = 0;
  if (tea > 0) {
    const counts: Record<string, number> = {};
    for (const c of tableau) {
      const cat = cardCategory(c.kind);
      if (cat === "special" || cat === "pudding") continue;
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    const max = Math.max(0, ...Object.values(counts));
    teaScore = tea * max;
  }

  // Soy Sauce: each soy sauce scores 4 points if you have the most distinct
  // card categories among players. We can't compute that per-seat alone, so
  // we model a simpler rule: each soy = 4 points if you have ≥4 distinct
  // categories in your tableau (else 0).
  const distinctCats = new Set<string>();
  for (const c of tableau) distinctCats.add(cardCategory(c.kind));
  const soyScore = soy * (distinctCats.size >= 4 ? 4 : 0);

  const total = nigiri + sashimiScore + tempuraScore + dumplingScore + makiPoints + teaScore + soyScore;
  return {
    nigiri,
    sashimi: sashimiScore,
    tempura: tempuraScore,
    dumpling: dumplingScore,
    maki: makiPoints,
    tea: teaScore + soyScore,  // bundle specials together for compact display
    total,
  };
  // (wasabiUsed / wasabiAvailable not surfaced — included in nigiri total)
  void wasabiUsed; void wasabiAvailable;
}

/** Compute Maki points per seat for one round.
 *  Most rolls: 6 split. 2nd most: 3 split. Ties split rounding down.
 *  Players with 0 rolls always score 0.
 */
export function scoreMaki(tableaus: Card[][]): number[] {
  const rolls = tableaus.map((t) => t.reduce((acc, c) => acc + makiCount(c.kind), 0));
  const result = [0, 0, 0, 0];
  const max = Math.max(...rolls);
  if (max === 0) return result;
  const firstSeats = rolls.map((r, i) => r === max ? i : -1).filter((i) => i >= 0);
  const firstShare = Math.floor(6 / firstSeats.length);
  for (const i of firstSeats) result[i] = firstShare;
  if (firstSeats.length === 1) {
    // award 2nd place
    let second = -1;
    for (const r of rolls) if (r > second && r < max) second = r;
    if (second > 0) {
      const secondSeats = rolls.map((r, i) => r === second ? i : -1).filter((i) => i >= 0);
      const secondShare = Math.floor(3 / secondSeats.length);
      for (const i of secondSeats) result[i] = secondShare;
    }
  }
  return result;
}

/** Pudding bonus: +6 to most, -6 to least. Ties split. Ignored if zero. */
export function scorePudding(puddings: number[]): number[] {
  const result = [0, 0, 0, 0];
  const max = Math.max(...puddings);
  const min = Math.min(...puddings);
  if (max > 0) {
    const winners = puddings.map((p, i) => p === max ? i : -1).filter((i) => i >= 0);
    const share = Math.floor(6 / winners.length);
    for (const i of winners) result[i] = (result[i] ?? 0) + share;
  }
  if (min < max) {
    const losers = puddings.map((p, i) => p === min ? i : -1).filter((i) => i >= 0);
    const share = -Math.floor(6 / losers.length);
    for (const i of losers) result[i] = (result[i] ?? 0) + share;
  }
  return result;
}

// ---------------------------------------------------------------------------
// CPU strategy
// ---------------------------------------------------------------------------
function cpuPickIndex(hand: Card[], tableau: Card[], seat: number): number {
  // Prefer Sashimi/Tempura set-completion, then Nigiri, then Maki, then specials.
  if (hand.length === 0) return 0;
  const sashimiCount = tableau.filter((c) => c.kind === "sashimi").length;
  const tempuraCount = tableau.filter((c) => c.kind === "tempura").length;
  const dumplingCount = tableau.filter((c) => c.kind === "dumpling").length;
  // Seat-derived priority tweak so 3 CPUs don't behave identically
  const seatBias = seat % 3;

  // Helper: find first index in hand matching a kind
  const find = (k: CardKind) => hand.findIndex((c) => c.kind === k);

  // Sashimi set completion (need 3-mod): always finish a set in progress
  if (sashimiCount % 3 !== 0) {
    const idx = find("sashimi");
    if (idx >= 0) return idx;
  }
  // Tempura set completion
  if (tempuraCount % 2 !== 0) {
    const idx = find("tempura");
    if (idx >= 0) return idx;
  }
  // Wasabi → Nigiri pairing: if a wasabi is unused, grab the best nigiri
  const wasabiPending = tableau.filter((c) => c.kind === "wasabi").length
    - tableau.filter((c, i) =>
        c.kind === "nigiri1" || c.kind === "nigiri2" || c.kind === "nigiri3"
          ? tableau.slice(0, i).filter((p) => p.kind === "wasabi").length
              > tableau.slice(0, i).filter((p) =>
                  p.kind === "nigiri1" || p.kind === "nigiri2" || p.kind === "nigiri3").length
          : false).length;
  if (wasabiPending > 0) {
    const idxN3 = find("nigiri3");
    if (idxN3 >= 0) return idxN3;
    const idxN2 = find("nigiri2");
    if (idxN2 >= 0) return idxN2;
    const idxN1 = find("nigiri1");
    if (idxN1 >= 0) return idxN1;
  }

  // Sashimi start (only if it's plausibly completable — 2 cards left for 3-set is fine)
  const idxSashimi = find("sashimi");
  if (sashimiCount === 0 && idxSashimi >= 0 && hand.length >= 3) {
    if (seatBias !== 2) return idxSashimi;
  }
  // Tempura start
  const idxTempura = find("tempura");
  if (tempuraCount === 0 && idxTempura >= 0 && hand.length >= 2) {
    return idxTempura;
  }

  // Best nigiri
  const idxN3 = find("nigiri3"); if (idxN3 >= 0) return idxN3;
  const idxN2 = find("nigiri2"); if (idxN2 >= 0) return idxN2;

  // Dumpling: marginal value rises sharply at 3+
  if (dumplingCount >= 1) {
    const idxD = find("dumpling");
    if (idxD >= 0) return idxD;
  }

  // Maki: top-tier 3-roll first
  const idxM3 = find("maki3"); if (idxM3 >= 0) return idxM3;
  if (seatBias === 0) {
    const idxM2 = find("maki2"); if (idxM2 >= 0) return idxM2;
  }

  // Pudding: only sometimes (seatBias to vary CPU diet)
  if (seatBias === 1) {
    const idxP = find("pudding");
    if (idxP >= 0) return idxP;
  }

  // Wasabi (banking for later nigiri)
  const idxW = find("wasabi");
  if (idxW >= 0 && hand.length >= 3 && seatBias !== 2) return idxW;

  // Egg nigiri
  const idxN1 = find("nigiri1"); if (idxN1 >= 0) return idxN1;
  // Remaining maki
  const idxM2 = find("maki2"); if (idxM2 >= 0) return idxM2;
  const idxM1 = find("maki1"); if (idxM1 >= 0) return idxM1;
  // Dumpling start
  const idxDS = find("dumpling"); if (idxDS >= 0) return idxDS;
  // Anything
  return 0;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
export function initialState(seed: number, _settings: SushiGoPartyFullSettings): SushiGoPartyFullState {
  void _settings;
  const rngState = { v: (seed >>> 0) || 1 };
  const hands = deal(1, rngState);
  return {
    round: 1,
    pickIndex: 0,
    phase: "picking",
    hands,
    tableaus: [[], [], [], []],
    roundScores: [[], [], [], []],
    puddings: [0, 0, 0, 0],
    totals: [0, 0, 0, 0],
    lastRoundLog: [],
    finalLog: [],
    rng: rngState.v,
  };
}

function rotateHands(hands: Card[][], round: number): Card[][] {
  // Odd rounds pass left (seat i gives to seat i+1). Even rounds pass right.
  const out: Card[][] = [[], [], [], []];
  for (let i = 0; i < NUM_PLAYERS; i++) {
    const giver = round % 2 === 1 ? (i + NUM_PLAYERS - 1) % NUM_PLAYERS : (i + 1) % NUM_PLAYERS;
    out[i] = hands[giver]!;
  }
  return out;
}

function completePick(state: SushiGoPartyFullState): SushiGoPartyFullState {
  // After human + 3 CPUs picked, advance one tick. If round complete, score.
  // Make new hand arrays (each seat: hand minus picked card).
  // We do all 4 picks atomically (human's already applied, CPUs choose now).
  const newHands = state.hands.map((h) => h.slice());
  const newTableaus = state.tableaus.map((t) => t.slice());

  // Human's pick has already been applied to state at action time; the
  // caller-passes-in state has hand[0] already shrunk and tableau[0] grown.
  // Here we run CPU picks 1..3.
  for (let seat = 1; seat < NUM_PLAYERS; seat++) {
    const hand = newHands[seat]!;
    const tableau = newTableaus[seat]!;
    if (hand.length === 0) continue;
    const idx = cpuPickIndex(hand, tableau, seat);
    const card = hand[Math.max(0, Math.min(idx, hand.length - 1))]!;
    newTableaus[seat] = tableau.concat(card);
    newHands[seat] = hand.filter((_, i) => i !== idx);
  }

  // Advance pick index
  const nextPickIndex = state.pickIndex + 1;

  // If round complete (everyone has 0 cards), score
  if (newHands.every((h) => h.length === 0)) {
    const makiPoints = scoreMaki(newTableaus);
    const breakdowns = newTableaus.map((t, i) => scoreSeatRound(t, makiPoints[i]!));
    const totals = state.totals.slice();
    const roundScores = state.roundScores.map((rs) => rs.slice());
    const puddings = state.puddings.slice();
    for (let i = 0; i < NUM_PLAYERS; i++) {
      totals[i] = (totals[i] ?? 0) + breakdowns[i]!.total;
      roundScores[i]!.push(breakdowns[i]!.total);
      // Tally puddings collected this round (carries across game)
      puddings[i] = (puddings[i] ?? 0) + newTableaus[i]!.filter((c) => c.kind === "pudding").length;
    }
    const log: string[] = newTableaus.map((_, i) => {
      const b = breakdowns[i]!;
      const seatName = i === HUMAN_SEAT ? "You" : `CPU ${i}`;
      return `${seatName}: ${b.total} (N${b.nigiri} S${b.sashimi} T${b.tempura} D${b.dumpling} Mk${b.maki} ★${b.tea})`;
    });

    // If final round, also apply pudding bonus and end game
    if (state.round >= TOTAL_ROUNDS) {
      const pudBonus = scorePudding(puddings);
      const finalLog: string[] = [];
      for (let i = 0; i < NUM_PLAYERS; i++) {
        totals[i] = (totals[i] ?? 0) + (pudBonus[i] ?? 0);
        const name = i === HUMAN_SEAT ? "You" : `CPU ${i}`;
        finalLog.push(`${name}: ${puddings[i]} puddings → ${pudBonus[i]! >= 0 ? "+" : ""}${pudBonus[i]}`);
      }
      return {
        ...state,
        hands: newHands,
        tableaus: newTableaus,
        roundScores,
        puddings,
        totals,
        lastRoundLog: log,
        finalLog,
        phase: "done",
        pickIndex: nextPickIndex,
      };
    }

    return {
      ...state,
      hands: newHands,
      tableaus: newTableaus,
      roundScores,
      puddings,
      totals,
      lastRoundLog: log,
      phase: "round-scored",
      pickIndex: nextPickIndex,
    };
  }

  // Otherwise rotate hands and continue picking
  const rotated = rotateHands(newHands, state.round);
  return {
    ...state,
    hands: rotated,
    tableaus: newTableaus,
    phase: "picking",
    pickIndex: nextPickIndex,
  };
}

export function reducer(state: SushiGoPartyFullState, action: SushiGoPartyFullAction): SushiGoPartyFullState {
  if (action.type === "pick") {
    if (state.phase !== "picking") return state;
    const hand = state.hands[HUMAN_SEAT];
    if (!hand || hand.length === 0) return state;
    if (action.idx < 0 || action.idx >= hand.length) return state;
    const card = hand[action.idx]!;
    const newHands = state.hands.map((h) => h.slice());
    const newTableaus = state.tableaus.map((t) => t.slice());
    newHands[HUMAN_SEAT] = hand.filter((_, i) => i !== action.idx);
    newTableaus[HUMAN_SEAT] = newTableaus[HUMAN_SEAT]!.concat(card);
    const after: SushiGoPartyFullState = { ...state, hands: newHands, tableaus: newTableaus };
    return completePick(after);
  }
  if (action.type === "next") {
    if (state.phase !== "round-scored") return state;
    if (state.round >= TOTAL_ROUNDS) return state;
    const rngState = { v: state.rng };
    const newHands = deal(state.round + 1, rngState);
    return {
      ...state,
      round: state.round + 1,
      pickIndex: 0,
      phase: "picking",
      hands: newHands,
      tableaus: [[], [], [], []],
      rng: rngState.v,
    };
  }
  return state;
}

// ---------------------------------------------------------------------------
// Terminal
// ---------------------------------------------------------------------------
export function isTerminal(state: SushiGoPartyFullState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Score = your total points if you placed 1st (with tie-break by puddings),
  // else 0 to keep losses off the leaderboard.
  const me = state.totals[HUMAN_SEAT] ?? 0;
  const max = Math.max(...state.totals);
  if (me < max) return { score: 0 };
  // Tie-break: most puddings wins. Else still a win (shared first).
  const tiedSeats = state.totals
    .map((t, i) => t === max ? i : -1)
    .filter((i) => i >= 0);
  if (tiedSeats.length === 1) return { score: me };
  const maxPud = Math.max(...tiedSeats.map((i) => state.puddings[i] ?? 0));
  const myPud = state.puddings[HUMAN_SEAT] ?? 0;
  if (myPud < maxPud) return { score: 0 };
  return { score: me };
}
