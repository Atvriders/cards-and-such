import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Sequence (Full): 10x10 board with each cell labeled with a playing card
// (excluding Jacks). Two of every non-J card on the board (in different cells),
// plus 4 free corners. Players have 7-card hands drawn from two 52-card decks
// (104 cards, no jokers). Play a card from hand, place a chip on a matching
// empty space, draw a replacement. J♦/J♣ are two-eyed (wild place anywhere
// empty). J♠/J♥ are one-eyed (remove an opponent chip, except from a completed
// sequence). Corners count as part of any sequence touching them. First to
// claim 2 sequences of 5 chips (horizontal/vertical/diagonal) wins.

export const BOARD_SIZE = 10;
export const HAND_SIZE = 7;
export const TARGET_SEQUENCES = 2;
export const RUN_LEN = 5;

export type Suit = "H" | "D" | "C" | "S";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface SequenceFullSettings {
  _dummy: boolean;
}

export type Cell = 0 | 1 | null; // 0 = player chip, 1 = bot chip, null = empty
// Free corners are represented by a special card label "FREE".

export interface BoardCellLabel {
  // Either a normal card or the free corner sentinel.
  isFree: boolean;
  card: Card | null;
}

export type Phase = "playing" | "select-remove" | "done";

export interface SequenceFullState {
  rngSeed: number;
  board: Cell[]; // 100 cells, index = row * 10 + col
  // Per-cell membership in a completed sequence for each player.
  // Once a chip is part of a completed sequence, it cannot be removed.
  lockedFor: Array<0 | 1 | null>; // 0/1 if locked into that player's sequence, null otherwise
  hands: [Card[], Card[]]; // [player, bot]
  deck: Card[]; // remaining cards
  discard: Card[];
  turn: 0 | 1;
  sequences: [number, number]; // count of completed sequences for [player, bot]
  phase: Phase;
  // When the player plays a one-eyed J, we wait for them to select an opponent
  // chip to remove. The played card is set here; on selection we discard +
  // draw a replacement.
  pendingRemoveCard: Card | null;
  selectedHandIdx: number | null; // UI: which card is staged for play
  winner: 0 | 1 | null;
  lastAction: string;
}

export type SequenceFullAction =
  | { type: "select-card"; handIdx: number }
  | { type: "play"; handIdx: number; cellIdx: number }
  | { type: "remove-chip"; cellIdx: number }
  | { type: "cancel-remove" }
  | { type: "discard-dead"; handIdx: number }; // optional helper: discard a dead card (both board spaces covered)

// ---------- Board layout ----------
// Standard Sequence board layout (one common arrangement). Corners at the four
// corners. We encode the 100 cells; corners (0, 9, 90, 99) are FREE. The other
// 96 cells hold 48 distinct non-J cards × 2 each.

const SUITS: Suit[] = ["H", "D", "C", "S"];
const NON_J_RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Q", "K"];

function buildBoardLabels(): BoardCellLabel[] {
  // Deterministic, hand-rolled layout: corners free, then place each non-J card
  // twice in a fixed pattern. The pattern below is a balanced sweep that gives
  // a stable layout (not the exact retail board, but rules-correct).
  const labels: BoardCellLabel[] = new Array(100);
  // Generate 96 card slots in fixed order (suit-major, rank-major), each twice.
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of NON_J_RANKS) {
      cards.push({ suit: s, rank: r });
    }
  }
  // cards.length = 48; duplicate so we have 96.
  const allLabels: BoardCellLabel[] = [];
  // Forward order for first copy, reverse order for second copy — guarantees the
  // two copies of any card live in different cells.
  for (const c of cards) allLabels.push({ isFree: false, card: c });
  for (let i = cards.length - 1; i >= 0; i--) allLabels.push({ isFree: false, card: cards[i]! });

  let cursor = 0;
  for (let i = 0; i < 100; i++) {
    if (i === 0 || i === 9 || i === 90 || i === 99) {
      labels[i] = { isFree: true, card: null };
    } else {
      labels[i] = allLabels[cursor++]!;
    }
  }
  return labels;
}

export const BOARD_LABELS: BoardCellLabel[] = buildBoardLabels();

// Quick reverse index: card key -> list of cell indices that hold it
function cardKey(c: Card): string { return `${c.rank}${c.suit}`; }
const CARD_TO_CELLS: Map<string, number[]> = (() => {
  const m = new Map<string, number[]>();
  for (let i = 0; i < BOARD_LABELS.length; i++) {
    const lbl = BOARD_LABELS[i]!;
    if (lbl.isFree || !lbl.card) continue;
    const k = cardKey(lbl.card);
    const arr = m.get(k) ?? [];
    arr.push(i);
    m.set(k, arr);
  }
  return m;
})();

export function cellsForCard(card: Card): number[] {
  return CARD_TO_CELLS.get(cardKey(card)) ?? [];
}

// Jack helpers
export function isTwoEyedJack(c: Card): boolean {
  return c.rank === "J" && (c.suit === "D" || c.suit === "C");
}
export function isOneEyedJack(c: Card): boolean {
  return c.rank === "J" && (c.suit === "S" || c.suit === "H");
}

// ---------- Deck ----------
function buildDeck(): Card[] {
  const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const out: Card[] = [];
  for (let copy = 0; copy < 2; copy++) {
    for (const s of SUITS) {
      for (const r of ranks) out.push({ suit: s, rank: r });
    }
  }
  return out;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]!; a[i] = a[j]!; a[j] = tmp;
  }
  return a;
}

// ---------- Sequence detection ----------
// 8 directions but only 4 unique line orientations.
const LINE_DIRS: Array<[number, number]> = [
  [0, 1], // horizontal
  [1, 0], // vertical
  [1, 1], // diagonal down-right
  [1, -1], // diagonal down-left
];

function inBounds(r: number, c: number): boolean {
  return r >= 0 && c >= 0 && r < BOARD_SIZE && c < BOARD_SIZE;
}

function idx(r: number, c: number): number { return r * BOARD_SIZE + c; }
export function rcOf(i: number): [number, number] { return [Math.floor(i / BOARD_SIZE), i % BOARD_SIZE]; }

function isOwnedOrCorner(board: Cell[], r: number, c: number, seat: 0 | 1): boolean {
  if (!inBounds(r, c)) return false;
  const i = idx(r, c);
  if (BOARD_LABELS[i]!.isFree) return true;
  return board[i] === seat;
}

// Find a fresh sequence of exactly 5 in a row containing a freshly placed
// cell. Returns the list of cell indices of the new sequence, or null. We
// allow at most ONE cell to overlap with cells already locked into another
// sequence belonging to the same player (standard Sequence rule).
function findNewSequenceThrough(
  board: Cell[],
  lockedFor: Array<0 | 1 | null>,
  seat: 0 | 1,
  newCellIdx: number,
): number[] | null {
  const [pr, pc] = rcOf(newCellIdx);
  for (const [dr, dc] of LINE_DIRS) {
    // Walk back to find the start of the longest run including (pr,pc).
    let startR = pr; let startC = pc;
    while (isOwnedOrCorner(board, startR - dr, startC - dc, seat)) {
      startR -= dr; startC -= dc;
    }
    // Now walk forward and try every length-5 window in this line that
    // includes the new cell.
    let r = startR, c = startC;
    const line: number[] = [];
    while (isOwnedOrCorner(board, r, c, seat)) {
      line.push(idx(r, c));
      r += dr; c += dc;
    }
    if (line.length < RUN_LEN) continue;
    // The new cell must be in the window. Find its position in line.
    const newPos = line.indexOf(newCellIdx);
    if (newPos < 0) continue;
    for (let start = Math.max(0, newPos - (RUN_LEN - 1));
         start <= Math.min(line.length - RUN_LEN, newPos);
         start++) {
      const window = line.slice(start, start + RUN_LEN);
      // Count overlap with cells already locked for this seat.
      let overlap = 0;
      for (const ci of window) {
        if (lockedFor[ci] === seat) overlap++;
      }
      if (overlap <= 1) {
        return window;
      }
    }
  }
  return null;
}

// ---------- Initial state ----------
export function initialState(seed: number, _settings: SequenceFullSettings): SequenceFullState {
  const rng = mulberry32(seed);
  const deckShuffled = shuffle(buildDeck(), rng);
  const playerHand: Card[] = [];
  const botHand: Card[] = [];
  // Deal 7 each, alternating.
  let cursor = 0;
  for (let i = 0; i < HAND_SIZE; i++) {
    playerHand.push(deckShuffled[cursor++]!);
    botHand.push(deckShuffled[cursor++]!);
  }
  const rest = deckShuffled.slice(cursor);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    board: new Array(100).fill(null),
    lockedFor: new Array(100).fill(null),
    hands: [playerHand, botHand],
    deck: rest,
    discard: [],
    turn: 0,
    sequences: [0, 0],
    phase: "playing",
    pendingRemoveCard: null,
    selectedHandIdx: null,
    winner: null,
    lastAction: "Game started. Play a card from your hand.",
  };
}

// ---------- Action helpers ----------
function drawReplacement(state: SequenceFullState, seat: 0 | 1): {
  hand: Card[]; deck: Card[]; rngSeed: number;
} {
  const hand = state.hands[seat].slice();
  let deck = state.deck;
  let rngSeed = state.rngSeed;
  if (deck.length === 0 && state.discard.length > 0) {
    const rng = mulberry32(rngSeed);
    deck = shuffle(state.discard, rng);
    rngSeed = Math.floor(rng() * 2 ** 31);
  }
  if (deck.length > 0) {
    const draw = deck[0]!;
    hand.push(draw);
    deck = deck.slice(1);
  }
  return { hand, deck, rngSeed };
}

export function isDeadCard(state: SequenceFullState, card: Card): boolean {
  if (card.rank === "J") return false;
  const cells = cellsForCard(card);
  return cells.every((ci) => state.board[ci] !== null);
}

// ---------- Reducer ----------
export function reducer(state: SequenceFullState, action: SequenceFullAction): SequenceFullState {
  if (state.phase === "done") return state;
  if (state.winner !== null) return state;

  if (action.type === "select-card") {
    if (state.turn !== 0) return state;
    if (state.phase !== "playing") return state;
    const idx_ = action.handIdx;
    if (idx_ < 0 || idx_ >= state.hands[0].length) return state;
    return { ...state, selectedHandIdx: idx_ };
  }

  if (action.type === "cancel-remove") {
    if (state.phase !== "select-remove") return state;
    return { ...state, phase: "playing", pendingRemoveCard: null };
  }

  if (action.type === "discard-dead") {
    if (state.turn !== 0) return state;
    if (state.phase !== "playing") return state;
    const idx_ = action.handIdx;
    if (idx_ < 0 || idx_ >= state.hands[0].length) return state;
    const card = state.hands[0][idx_]!;
    if (!isDeadCard(state, card)) return state;
    const newHand = state.hands[0].slice();
    newHand.splice(idx_, 1);
    const newDiscard = [...state.discard, card];
    const drawResult = drawReplacement(
      { ...state, hands: [newHand, state.hands[1]], discard: newDiscard },
      0,
    );
    const next: SequenceFullState = {
      ...state,
      hands: [drawResult.hand, state.hands[1]],
      deck: drawResult.deck,
      discard: newDiscard,
      rngSeed: drawResult.rngSeed,
      selectedHandIdx: null,
      lastAction: "You discarded a dead card.",
    };
    // After a dead-card discard, the same player still gets a real turn? In
    // Sequence, dead-card discard is a free action — player still plays.
    return next;
  }

  if (action.type === "remove-chip") {
    if (state.phase !== "select-remove") return state;
    if (state.turn !== 0) return state;
    const ci = action.cellIdx;
    if (ci < 0 || ci >= 100) return state;
    if (state.board[ci] !== 1) return state; // must be an opponent chip
    if (state.lockedFor[ci] === 1) return state; // can't remove a sequence chip
    const card = state.pendingRemoveCard;
    if (!card) return state;
    const newBoard = state.board.slice();
    newBoard[ci] = null;
    // Discard the one-eyed jack, draw replacement
    const newHandP = state.hands[0].slice();
    // The card was already removed from the hand when the play was issued; nothing to do here.
    const newDiscard = [...state.discard, card];
    const drawResult = drawReplacement(
      { ...state, hands: [newHandP, state.hands[1]], discard: newDiscard, board: newBoard },
      0,
    );
    // Hand it off to the bot.
    let next: SequenceFullState = {
      ...state,
      board: newBoard,
      hands: [drawResult.hand, state.hands[1]],
      deck: drawResult.deck,
      discard: newDiscard,
      rngSeed: drawResult.rngSeed,
      phase: "playing",
      pendingRemoveCard: null,
      selectedHandIdx: null,
      turn: 1,
      lastAction: "You removed an opponent chip.",
    };
    next = runBot(next);
    return next;
  }

  if (action.type === "play") {
    if (state.turn !== 0) return state;
    if (state.phase !== "playing") return state;
    const handIdx = action.handIdx;
    if (handIdx < 0 || handIdx >= state.hands[0].length) return state;
    const card = state.hands[0][handIdx]!;
    return applyPlay(state, 0, handIdx, card, action.cellIdx);
  }

  return state;
}

function applyPlay(
  state: SequenceFullState,
  seat: 0 | 1,
  handIdx: number,
  card: Card,
  cellIdx: number,
): SequenceFullState {
  if (cellIdx < 0 || cellIdx >= 100) return state;
  const lbl = BOARD_LABELS[cellIdx]!;

  // One-eyed jack: remove an opponent chip.
  if (isOneEyedJack(card)) {
    if (seat !== 0) {
      // Bot path: bot already chose cellIdx as the chip to remove.
      if (state.board[cellIdx] !== 0) return state;
      if (state.lockedFor[cellIdx] === 0) return state;
      const newBoard = state.board.slice();
      newBoard[cellIdx] = null;
      const newHandB = state.hands[1].slice();
      newHandB.splice(handIdx, 1);
      const newDiscard = [...state.discard, card];
      const drawResult = drawReplacement(
        { ...state, hands: [state.hands[0], newHandB], discard: newDiscard, board: newBoard },
        1,
      );
      return {
        ...state,
        board: newBoard,
        hands: [state.hands[0], drawResult.hand],
        deck: drawResult.deck,
        discard: newDiscard,
        rngSeed: drawResult.rngSeed,
        turn: 0,
        lastAction: "Bot removed one of your chips.",
      };
    } else {
      // Player path: transition to select-remove. We pull the card out of the
      // player's hand immediately so the staged action is committed.
      const newHand = state.hands[0].slice();
      newHand.splice(handIdx, 1);
      return {
        ...state,
        hands: [newHand, state.hands[1]],
        phase: "select-remove",
        pendingRemoveCard: card,
        selectedHandIdx: null,
        lastAction: "Choose an opponent chip to remove (cannot remove sequence chips).",
      };
    }
  }

  // Two-eyed jack: place a chip anywhere empty (no card match required).
  if (isTwoEyedJack(card)) {
    if (state.board[cellIdx] !== null) return state;
    if (BOARD_LABELS[cellIdx]!.isFree) return state; // can't place on free corner
    return commitPlace(state, seat, handIdx, card, cellIdx);
  }

  // Regular card: must match an empty matching cell.
  if (lbl.isFree) return state;
  if (!lbl.card) return state;
  if (lbl.card.rank !== card.rank || lbl.card.suit !== card.suit) return state;
  if (state.board[cellIdx] !== null) return state;
  return commitPlace(state, seat, handIdx, card, cellIdx);
}

function commitPlace(
  state: SequenceFullState,
  seat: 0 | 1,
  handIdx: number,
  card: Card,
  cellIdx: number,
): SequenceFullState {
  const newBoard = state.board.slice();
  newBoard[cellIdx] = seat;
  const newLocked = state.lockedFor.slice();

  // Detect a fresh sequence through this cell.
  const newSeq = findNewSequenceThrough(newBoard, newLocked, seat, cellIdx);
  const seqs: [number, number] = [state.sequences[0], state.sequences[1]];
  let lastAction = `${seat === 0 ? "You" : "Bot"} placed a chip.`;
  if (newSeq) {
    for (const ci of newSeq) {
      if (newLocked[ci] !== seat) newLocked[ci] = seat;
    }
    seqs[seat]++;
    lastAction = `${seat === 0 ? "You" : "Bot"} completed a sequence!`;
  }

  // Update the playing seat's hand and discard.
  const handCopy = state.hands[seat].slice();
  handCopy.splice(handIdx, 1);
  const newDiscard = [...state.discard, card];
  const hands: [Card[], Card[]] = [state.hands[0].slice(), state.hands[1].slice()];
  hands[seat] = handCopy;

  // Draw replacement.
  const tempState: SequenceFullState = {
    ...state,
    board: newBoard,
    lockedFor: newLocked,
    hands,
    discard: newDiscard,
    sequences: seqs,
  };
  const draw = drawReplacement(tempState, seat);
  hands[seat] = draw.hand;

  const winner: 0 | 1 | null = seqs[0] >= TARGET_SEQUENCES ? 0
    : seqs[1] >= TARGET_SEQUENCES ? 1 : null;

  let next: SequenceFullState = {
    ...state,
    board: newBoard,
    lockedFor: newLocked,
    hands,
    deck: draw.deck,
    discard: newDiscard,
    rngSeed: draw.rngSeed,
    sequences: seqs,
    turn: (seat === 0 ? 1 : 0) as 0 | 1,
    phase: winner !== null ? "done" : "playing",
    pendingRemoveCard: null,
    selectedHandIdx: null,
    winner,
    lastAction,
  };

  if (winner === null && seat === 0) {
    next = runBot(next);
  }
  return next;
}

// ---------- Bot ----------
// Heuristic: for every legal play, compute a score:
//   +1000 if it completes a new sequence for the bot
//   +100 * (extension length) if it extends an existing bot run (longest line
//        through the new chip)
//   +50 * (extension length) if it blocks a player run of length >= 3
//   small random tiebreak
// For one-eyed jacks: target a player chip that is part of a length-3+ run.

interface BotMove {
  handIdx: number;
  cellIdx: number; // for placement; for one-eyed J this is the chip to remove
  score: number;
}

function longestRunThrough(
  board: Cell[],
  seat: 0 | 1,
  cellIdx: number,
): number {
  let best = 1;
  const [pr, pc] = rcOf(cellIdx);
  for (const [dr, dc] of LINE_DIRS) {
    let count = 1;
    // forward
    let r = pr + dr, c = pc + dc;
    while (isOwnedOrCorner(board, r, c, seat)) { count++; r += dr; c += dc; }
    // backward
    r = pr - dr; c = pc - dc;
    while (isOwnedOrCorner(board, r, c, seat)) { count++; r -= dr; c -= dc; }
    if (count > best) best = count;
  }
  return best;
}

function botCandidatePlays(state: SequenceFullState): BotMove[] {
  const moves: BotMove[] = [];
  const hand = state.hands[1];
  for (let h = 0; h < hand.length; h++) {
    const card = hand[h]!;
    if (isOneEyedJack(card)) {
      // Each removable opponent chip is a candidate.
      for (let ci = 0; ci < 100; ci++) {
        if (state.board[ci] !== 0) continue;
        if (state.lockedFor[ci] === 0) continue;
        // Score by the longest opponent run through this chip — prefer breaking up big ones.
        const playerRun = longestRunThrough(state.board, 0, ci);
        const score = playerRun >= 4 ? 900 : playerRun === 3 ? 400 : playerRun * 30;
        moves.push({ handIdx: h, cellIdx: ci, score });
      }
      continue;
    }
    if (isTwoEyedJack(card)) {
      // Two-eyed jack: can place on any empty non-free cell.
      for (let ci = 0; ci < 100; ci++) {
        if (state.board[ci] !== null) continue;
        if (BOARD_LABELS[ci]!.isFree) continue;
        moves.push({ handIdx: h, cellIdx: ci, score: scorePlacement(state, 1, ci) });
      }
      continue;
    }
    // Regular card: only legal in matching empty cells.
    for (const ci of cellsForCard(card)) {
      if (state.board[ci] !== null) continue;
      moves.push({ handIdx: h, cellIdx: ci, score: scorePlacement(state, 1, ci) });
    }
  }
  return moves;
}

function scorePlacement(state: SequenceFullState, seat: 0 | 1, cellIdx: number): number {
  // Simulate placement and check for a fresh sequence.
  const tmpBoard = state.board.slice();
  tmpBoard[cellIdx] = seat;
  const seq = findNewSequenceThrough(tmpBoard, state.lockedFor, seat, cellIdx);
  if (seq) return 1000;
  const myRun = longestRunThrough(tmpBoard, seat, cellIdx);
  const opp: 0 | 1 = seat === 0 ? 1 : 0;
  // Block score: pretend opponent plays here instead — how long is their run?
  const blockBoard = state.board.slice();
  blockBoard[cellIdx] = opp;
  const oppRun = longestRunThrough(blockBoard, opp, cellIdx);
  let score = myRun * 100;
  if (oppRun >= 4) score = Math.max(score, 600);
  else if (oppRun === 3) score = Math.max(score, 250 + myRun * 50);
  return score;
}

function runBot(state: SequenceFullState): SequenceFullState {
  if (state.winner !== null) return state;
  if (state.turn !== 1) return state;
  // Find any dead cards in bot's hand — auto-discard them as a free action.
  let s = state;
  for (let i = s.hands[1].length - 1; i >= 0; i--) {
    const card = s.hands[1][i]!;
    if (isDeadCard(s, card)) {
      const newHand = s.hands[1].slice();
      newHand.splice(i, 1);
      const newDiscard = [...s.discard, card];
      const draw = drawReplacement(
        { ...s, hands: [s.hands[0], newHand], discard: newDiscard },
        1,
      );
      s = {
        ...s,
        hands: [s.hands[0], draw.hand],
        deck: draw.deck,
        discard: newDiscard,
        rngSeed: draw.rngSeed,
      };
    }
  }

  // Pick the highest-scoring move. Random tiebreak.
  const moves = botCandidatePlays(s);
  if (moves.length === 0) {
    // No legal play (very rare): pass the turn back.
    return { ...s, turn: 0, lastAction: "Bot had no legal play and passes." };
  }
  const rng = mulberry32(s.rngSeed);
  for (const m of moves) m.score += rng() * 5;
  const nextSeed = Math.floor(rng() * 2 ** 31);
  moves.sort((a, b) => b.score - a.score);
  const chosen = moves[0]!;
  s = { ...s, rngSeed: nextSeed };
  const card = s.hands[1][chosen.handIdx]!;
  return applyPlay(s, 1, chosen.handIdx, card, chosen.cellIdx);
}

// ---------- Terminal ----------
export function isTerminal(state: SequenceFullState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}

// Internal exports for tests
export { findNewSequenceThrough, longestRunThrough, applyPlay, runBot, buildDeck };
