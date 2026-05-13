import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ── card model ──────────────────────────────────────────────────────────────

export type UnoColor = "R" | "Y" | "G" | "B";
export type UnoWildColor = UnoColor | "W"; // W only valid for unset on wild

/**
 * value semantics:
 *   "0".."9"  → number cards
 *   "Skip"    → next player loses turn
 *   "Reverse" → reverse direction
 *   "Draw2"   → next player draws 2 and loses turn
 *   "Wild"    → choose any color
 *   "WildD4"  → wild draw four
 */
export type UnoValue =
  | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
  | "Skip" | "Reverse" | "Draw2" | "Wild" | "WildD4";

export interface UnoCard {
  id: string;
  color: UnoColor | null; // null on Wild/WildD4 in the deck
  value: UnoValue;
}

export interface UnoFullSettings {
  targetScore: "200" | "500" | "1000";
  challengeWildD4: boolean;
}

export type Phase = "playing" | "pickColor" | "roundOver" | "gameOver";

export interface UnoFullState {
  settings: UnoFullSettings;
  seats: number;
  hands: readonly (readonly UnoCard[])[];
  stock: readonly UnoCard[];
  discard: readonly UnoCard[]; // top is last element
  activeColor: UnoColor; // current declared color (after a wild this changes)
  turn: number;
  /** +1 or -1 — direction of play */
  direction: 1 | -1;
  /** Players (seat index) currently with 1 card who have called UNO. */
  unoCalled: readonly boolean[];
  /** Pending wild that needs a color choice from human (seat 0). */
  pendingWild: { cardId: string; isD4: boolean } | null;
  /** Stacked draw count from Draw2s pending. (Not stacked across plays — UNO
   *  rules don't allow stacking by default, but this lets us apply +2 on a
   *  card-by-card basis.) */
  pendingDraws: number;
  /** Has the current player already drawn this turn? */
  drewThisTurn: boolean;
  /** The drawn card from this turn (player may still play it). */
  drawnCard: UnoCard | null;
  /** Scores accumulated across rounds. */
  scores: readonly number[];
  /** When a round ends, the seat that emptied their hand. */
  roundWinner: number | null;
  /** Final overall winner. */
  gameWinner: number | null;
  /** Current RNG seed (advanced as we use it). */
  rngSeed: number;
  /** Current phase. */
  phase: Phase;
  /** A short log of recent events. Newest first. */
  log: readonly string[];
}

export type UnoFullAction =
  | { type: "play"; cardId: string }
  | { type: "pickColor"; color: UnoColor }
  | { type: "draw" }
  | { type: "passAfterDraw" }
  | { type: "callUno" }
  | { type: "nextRound" };

// ── deck construction ───────────────────────────────────────────────────────

const COLORS: readonly UnoColor[] = ["R", "Y", "G", "B"];

export function buildDeck(): UnoCard[] {
  const deck: UnoCard[] = [];
  let n = 0;
  for (const c of COLORS) {
    // one 0
    deck.push({ id: `c${n++}`, color: c, value: "0" });
    // 1..9 twice
    for (let v = 1; v <= 9; v++) {
      const val = String(v) as UnoValue;
      deck.push({ id: `c${n++}`, color: c, value: val });
      deck.push({ id: `c${n++}`, color: c, value: val });
    }
    // 2x Skip, 2x Reverse, 2x Draw2
    for (let k = 0; k < 2; k++) {
      deck.push({ id: `c${n++}`, color: c, value: "Skip" });
      deck.push({ id: `c${n++}`, color: c, value: "Reverse" });
      deck.push({ id: `c${n++}`, color: c, value: "Draw2" });
    }
  }
  // 4 Wild, 4 WildD4
  for (let k = 0; k < 4; k++) {
    deck.push({ id: `c${n++}`, color: null, value: "Wild" });
    deck.push({ id: `c${n++}`, color: null, value: "WildD4" });
  }
  return deck;
}

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

// ── card / scoring helpers ──────────────────────────────────────────────────

export function isWild(card: UnoCard): boolean {
  return card.value === "Wild" || card.value === "WildD4";
}

export function isAction(card: UnoCard): boolean {
  return card.value === "Skip" || card.value === "Reverse" || card.value === "Draw2";
}

export function cardPoints(c: UnoCard): number {
  if (c.value === "Wild" || c.value === "WildD4") return 50;
  if (c.value === "Skip" || c.value === "Reverse" || c.value === "Draw2") return 20;
  // numeric
  return Number(c.value);
}

export function isPlayable(card: UnoCard, top: UnoCard, activeColor: UnoColor): boolean {
  if (isWild(card)) return true;
  if (card.color === activeColor) return true;
  if (!isWild(top) && card.color === top.color) return true;
  if (card.value === top.value) return true;
  return false;
}

function topOf(discard: readonly UnoCard[]): UnoCard {
  return discard[discard.length - 1]!;
}

function recycleDiscardIntoStock(
  stock: readonly UnoCard[],
  discard: readonly UnoCard[],
  rngSeed: number,
): { stock: readonly UnoCard[]; discard: readonly UnoCard[]; rngSeed: number } {
  if (stock.length > 0 || discard.length <= 1) return { stock, discard, rngSeed };
  const top = topOf(discard);
  const rest = discard.slice(0, -1).map((c) => {
    // strip declared colors off wilds when returning to the stock
    if (c.value === "Wild" || c.value === "WildD4") return { ...c, color: null };
    return c;
  });
  const rng = mulberry32(rngSeed);
  const reshuffled = shuffle(rest, rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { stock: reshuffled, discard: [top], rngSeed: nextSeed };
}

// ── initialState ────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: UnoFullSettings): UnoFullState {
  return startRound(seed, settings, [0, 0, 0, 0]);
}

function startRound(
  seed: number,
  settings: UnoFullSettings,
  scores: readonly number[],
): UnoFullState {
  const seats = 4;
  const rng = mulberry32(seed);
  let deck = shuffle(buildDeck(), rng);

  // Deal 7 to each seat
  const hands: UnoCard[][] = Array.from({ length: seats }, () => []);
  let idx = 0;
  for (let i = 0; i < 7; i++) {
    for (let p = 0; p < seats; p++) {
      hands[p]!.push(deck[idx++]!);
    }
  }

  // Flip first discard — reshuffle until non-wild for simplicity
  while (deck[idx]!.value === "Wild" || deck[idx]!.value === "WildD4") {
    const swap = idx + 1 + Math.floor(rng() * (deck.length - idx - 1));
    const tmp = deck[idx]!;
    deck[idx] = deck[swap]!;
    deck[swap] = tmp;
  }
  const firstCard = deck[idx]!;
  const stockCards = deck.slice(idx + 1);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  let state: UnoFullState = {
    settings,
    seats,
    hands: hands.map((h) => [...h]),
    stock: stockCards,
    discard: [firstCard],
    activeColor: firstCard.color ?? "R",
    turn: 0,
    direction: 1,
    unoCalled: [false, false, false, false],
    pendingWild: null,
    pendingDraws: 0,
    drewThisTurn: false,
    drawnCard: null,
    scores,
    roundWinner: null,
    gameWinner: null,
    rngSeed: nextSeed,
    phase: "playing",
    log: [],
  };

  // First card effect (vanilla UNO):
  //  - if Skip: dealer skips first player (player to dealer's left loses turn)
  //  - if Reverse: direction flips, dealer plays first
  //  - if Draw2: first player draws 2 and is skipped
  //  - if Wild: first player chooses color (handled by reshuffle above so we
  //    never start on a wild; simpler & deterministic)
  if (firstCard.value === "Skip") {
    state = { ...state, turn: nextSeat(state.turn, state.direction, seats) };
    state = pushLog(state, "Starting Skip — seat 0 skipped");
  } else if (firstCard.value === "Reverse") {
    state = { ...state, direction: -1 };
    // With direction -1 from seat 0, next player is seat 3
    state = { ...state, turn: nextSeat(0, -1, seats) };
    state = pushLog(state, "Starting Reverse — direction flipped");
  } else if (firstCard.value === "Draw2") {
    const drawn = drawN(state, 0, 2);
    state = drawn.state;
    state = { ...state, turn: nextSeat(0, state.direction, seats) };
    state = pushLog(state, "Starting Draw2 — seat 0 drew 2 and is skipped");
  }

  // If a bot is up first, run them
  state = runBots(state);
  return state;
}

// ── small mutators ──────────────────────────────────────────────────────────

function pushLog(state: UnoFullState, msg: string): UnoFullState {
  const log = [msg, ...state.log].slice(0, 8);
  return { ...state, log };
}

function nextSeat(turn: number, dir: 1 | -1, seats: number): number {
  return (turn + dir + seats) % seats;
}

interface DrawNResult {
  state: UnoFullState;
  drawn: UnoCard[];
}

function drawN(state: UnoFullState, seat: number, n: number): DrawNResult {
  let s = state;
  const drawn: UnoCard[] = [];
  for (let i = 0; i < n; i++) {
    const recycled = recycleDiscardIntoStock(s.stock, s.discard, s.rngSeed);
    s = { ...s, stock: recycled.stock, discard: recycled.discard, rngSeed: recycled.rngSeed };
    if (s.stock.length === 0) break;
    const card = s.stock[0]!;
    drawn.push(card);
    const newHands = s.hands.map((h, i2) => (i2 === seat ? [...h, card] : [...h]));
    s = { ...s, stock: s.stock.slice(1), hands: newHands };
  }
  // If the drawing seat ends with > 1 card, clear their "called UNO" flag
  if (s.hands[seat]!.length !== 1) {
    s = { ...s, unoCalled: s.unoCalled.map((u, i2) => (i2 === seat ? false : u)) };
  }
  return { state: s, drawn };
}

function endRoundIfNeeded(state: UnoFullState, seat: number): UnoFullState {
  if (state.hands[seat]!.length !== 0) return state;
  // Round winner: seat. Score = sum of opponents' hand points.
  const pts = state.hands.reduce((sum, h, i) => (i === seat ? sum : sum + h.reduce((a, c) => a + cardPoints(c), 0)), 0);
  const newScores = state.scores.map((s, i) => (i === seat ? s + pts : s));
  const target = Number(state.settings.targetScore);
  if (newScores[seat]! >= target) {
    return {
      ...state,
      scores: newScores,
      roundWinner: seat,
      gameWinner: seat,
      phase: "gameOver",
      log: [`Seat ${seat} reached ${newScores[seat]} — game over!`, ...state.log].slice(0, 8),
    };
  }
  return {
    ...state,
    scores: newScores,
    roundWinner: seat,
    phase: "roundOver",
    log: [`Seat ${seat} wins the round (+${pts})`, ...state.log].slice(0, 8),
  };
}

// Check UNO-call penalty when transitioning turns: if the seat we're leaving
// has exactly 1 card and didn't call UNO, draw 4. We only apply this when the
// next player's turn is about to start (after this seat just played).
function maybePenaltyForMissedUno(state: UnoFullState, prevSeat: number): UnoFullState {
  if (state.hands[prevSeat]!.length === 1 && !state.unoCalled[prevSeat]) {
    const r = drawN(state, prevSeat, 4);
    return pushLog(r.state, `Seat ${prevSeat} forgot UNO — drew 4`);
  }
  return state;
}

function applyCardEffect(
  state: UnoFullState,
  seat: number,
  card: UnoCard,
  declaredColor: UnoColor | null,
): UnoFullState {
  let s = state;
  // Remove the card from the seat's hand and push to discard.
  const newHands = s.hands.map((h, i) => (i === seat ? h.filter((c) => c.id !== card.id) : [...h]));
  const discardCard: UnoCard = isWild(card)
    ? { ...card, color: declaredColor ?? card.color }
    : card;
  s = {
    ...s,
    hands: newHands,
    discard: [...s.discard, discardCard],
    activeColor: isWild(card) ? (declaredColor ?? "R") : card.color!,
    drewThisTurn: false,
    drawnCard: null,
  };

  // If hand became empty, end round
  if (s.hands[seat]!.length === 0) {
    s = endRoundIfNeeded(s, seat);
    return s;
  }

  // Penalty for missed UNO call when leaving a 1-card seat
  s = maybePenaltyForMissedUno(s, seat);

  // Apply action card effects
  let nextTurn = nextSeat(seat, s.direction, s.seats);
  if (card.value === "Skip") {
    nextTurn = nextSeat(nextTurn, s.direction, s.seats);
    s = pushLog(s, `Seat ${nextSeat(seat, s.direction, s.seats)} skipped`);
  } else if (card.value === "Reverse") {
    const newDir = (s.direction === 1 ? -1 : 1) as 1 | -1;
    s = { ...s, direction: newDir };
    if (s.seats === 2) {
      // In 2-player UNO, Reverse acts like Skip; we have 4 so we don't special-case
    }
    nextTurn = nextSeat(seat, s.direction, s.seats);
    s = pushLog(s, `Direction reversed`);
  } else if (card.value === "Draw2") {
    const victim = nextTurn;
    const r = drawN(s, victim, 2);
    s = r.state;
    nextTurn = nextSeat(victim, s.direction, s.seats);
    s = pushLog(s, `Seat ${victim} drew 2`);
  } else if (card.value === "WildD4") {
    const victim = nextTurn;
    const r = drawN(s, victim, 4);
    s = r.state;
    nextTurn = nextSeat(victim, s.direction, s.seats);
    s = pushLog(s, `Seat ${victim} drew 4 (wild)`);
  }

  return { ...s, turn: nextTurn };
}

// ── bot strategy ────────────────────────────────────────────────────────────

function botPickColor(hand: readonly UnoCard[]): UnoColor {
  const counts: Record<UnoColor, number> = { R: 0, Y: 0, G: 0, B: 0 };
  for (const c of hand) {
    if (c.color) counts[c.color]++;
  }
  let best: UnoColor = "R";
  let bestN = -1;
  for (const c of COLORS) {
    if (counts[c] > bestN) {
      bestN = counts[c];
      best = c;
    }
  }
  return best;
}

/** CPU heuristic per spec:
 *   prefer matching number → matching color → action cards → wilds.
 *   Save wilds for tight spots (i.e. when no other legal card).
 */
function botPickCard(hand: readonly UnoCard[], top: UnoCard, active: UnoColor): UnoCard | null {
  const legal = hand.filter((c) => isPlayable(c, top, active));
  if (legal.length === 0) return null;

  // 1) matching number (non-wild numeric matching top.value)
  const numMatch = legal.find(
    (c) => !isWild(c) && !isAction(c) && top.value === c.value,
  );
  if (numMatch) return numMatch;

  // 2) matching color (non-wild non-action)
  const colorMatch = legal.find((c) => !isWild(c) && !isAction(c) && c.color === active);
  if (colorMatch) return colorMatch;

  // 3) action card (non-wild)
  const action = legal.find((c) => !isWild(c) && isAction(c));
  if (action) return action;

  // 4) wild
  const wild = legal.find((c) => isWild(c));
  if (wild) return wild;

  return legal[0] ?? null;
}

function botTurn(state: UnoFullState): UnoFullState {
  const seat = state.turn;
  const hand = state.hands[seat]!;
  const top = topOf(state.discard);
  let chosen = botPickCard(hand, top, state.activeColor);

  if (chosen) {
    const color = isWild(chosen) ? botPickColor(hand) : null;
    let s = applyCardEffect(state, seat, chosen, color);
    // Bot calls UNO automatically when leaving 1 card
    if (s.hands[seat]!.length === 1) {
      s = { ...s, unoCalled: s.unoCalled.map((u, i) => (i === seat ? true : u)) };
    }
    return s;
  }

  // No legal card — draw one
  const r = drawN(state, seat, 1);
  let s = r.state;
  const drawn = r.drawn[0] ?? null;
  if (drawn && isPlayable(drawn, topOf(s.discard), s.activeColor)) {
    // Play it
    const color = isWild(drawn) ? botPickColor(s.hands[seat]!) : null;
    s = applyCardEffect(s, seat, drawn, color);
    if (s.hands[seat]!.length === 1) {
      s = { ...s, unoCalled: s.unoCalled.map((u, i) => (i === seat ? true : u)) };
    }
    return s;
  }

  // Pass
  return { ...s, turn: nextSeat(seat, s.direction, s.seats), drewThisTurn: false, drawnCard: null };
}

function runBots(state: UnoFullState): UnoFullState {
  let s = state;
  let guard = 0;
  while (
    s.phase === "playing" &&
    s.pendingWild === null &&
    s.turn !== 0 &&
    guard < 200
  ) {
    s = botTurn(s);
    guard++;
  }
  return s;
}

// ── reducer ─────────────────────────────────────────────────────────────────

export function reducer(state: UnoFullState, action: UnoFullAction): UnoFullState {
  if (state.phase === "gameOver") return state;

  if (action.type === "nextRound") {
    if (state.phase !== "roundOver") return state;
    // Advance seed and start a new round, carrying scores.
    return startRound(state.rngSeed, state.settings, state.scores);
  }

  if (state.phase === "roundOver") return state;

  if (action.type === "callUno") {
    if (state.hands[0]!.length === 1 || state.hands[0]!.length === 2) {
      // Allow calling UNO when you have 1 card already, or when about to play
      // your second-to-last card (pre-call).
      return { ...state, unoCalled: state.unoCalled.map((u, i) => (i === 0 ? true : u)) };
    }
    return state;
  }

  if (action.type === "pickColor") {
    if (state.phase !== "pickColor" || !state.pendingWild) return state;
    if (state.turn !== 0) return state;
    const card = state.hands[0]!.find((c) => c.id === state.pendingWild!.cardId);
    if (!card) return state;
    let s: UnoFullState = { ...state, phase: "playing", pendingWild: null };
    s = applyCardEffect(s, 0, card, action.color);
    if (s.phase === "gameOver" || s.phase === "roundOver") return s;
    return runBots(s);
  }

  if (action.type === "play") {
    if (state.phase !== "playing") return state;
    if (state.turn !== 0) return state;
    const hand = state.hands[0]!;
    const card = hand.find((c) => c.id === action.cardId);
    if (!card) return state;
    if (!isPlayable(card, topOf(state.discard), state.activeColor)) return state;

    if (isWild(card)) {
      // Need a color choice from the human
      return {
        ...state,
        phase: "pickColor",
        pendingWild: { cardId: card.id, isD4: card.value === "WildD4" },
      };
    }

    let s = applyCardEffect(state, 0, card, null);
    if (s.phase === "gameOver" || s.phase === "roundOver") return s;
    return runBots(s);
  }

  if (action.type === "draw") {
    if (state.phase !== "playing") return state;
    if (state.turn !== 0) return state;
    if (state.drewThisTurn) return state;
    const r = drawN(state, 0, 1);
    let s = r.state;
    const drawn = r.drawn[0] ?? null;
    if (!drawn) {
      // Stock and discard both depleted — pass
      return runBots({ ...s, turn: nextSeat(0, s.direction, s.seats) });
    }
    s = { ...s, drewThisTurn: true, drawnCard: drawn };
    // If the drawn card is not playable, auto-pass.
    if (!isPlayable(drawn, topOf(s.discard), s.activeColor)) {
      return runBots({ ...s, turn: nextSeat(0, s.direction, s.seats), drewThisTurn: false, drawnCard: null });
    }
    // Else, let the human decide via another play action or passAfterDraw
    return s;
  }

  if (action.type === "passAfterDraw") {
    if (state.phase !== "playing") return state;
    if (state.turn !== 0 || !state.drewThisTurn) return state;
    return runBots({
      ...state,
      turn: nextSeat(0, state.direction, state.seats),
      drewThisTurn: false,
      drawnCard: null,
    });
  }

  return state;
}

// ── terminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: UnoFullState): { score: number } | null {
  if (state.phase !== "gameOver") return null;
  // If human (seat 0) wins, score = scores[0]. Otherwise score is 0 (loss).
  if (state.gameWinner === 0) return { score: state.scores[0] ?? 0 };
  return { score: 0 };
}
