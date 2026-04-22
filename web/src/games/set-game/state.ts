import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Set card: 4 attributes × 3 values each = 81 cards
export type Attr3 = 0 | 1 | 2;

export interface SetCard {
  id: number;
  color: Attr3;    // 0=red, 1=green, 2=purple
  shape: Attr3;    // 0=oval, 1=diamond, 2=squiggle
  fill: Attr3;     // 0=empty, 1=striped, 2=solid
  count: Attr3;    // 0=1, 1=2, 2=3
}

const COLOR_LABEL = ["Red", "Green", "Purple"];
const SHAPE_LABEL = ["Oval", "Diamond", "Squiggle"];
const FILL_LABEL = ["Empty", "Striped", "Solid"];
const COUNT_LABEL = ["1", "2", "3"];

export function cardLabel(card: SetCard): string {
  return `${COUNT_LABEL[card.count]} ${COLOR_LABEL[card.color]} ${FILL_LABEL[card.fill]} ${SHAPE_LABEL[card.shape]}`;
}

export interface SetState {
  deck: SetCard[];
  table: (SetCard | null)[];  // 12 slots
  selected: number[];  // indices into table
  setsFound: number;
  invalidSet: boolean;
  noSetOnTable: boolean;
  won: boolean;
  score: number;
}

export type SetAction =
  | { type: "selectCard"; tableIndex: number }
  | { type: "hint" };

function buildDeck(rng: () => number): SetCard[] {
  const cards: SetCard[] = [];
  let id = 0;
  for (let color = 0; color < 3; color++) {
    for (let shape = 0; shape < 3; shape++) {
      for (let fill = 0; fill < 3; fill++) {
        for (let count = 0; count < 3; count++) {
          cards.push({
            id: id++,
            color: color as Attr3,
            shape: shape as Attr3,
            fill: fill as Attr3,
            count: count as Attr3,
          });
        }
      }
    }
  }
  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cards[i], cards[j]] = [cards[j]!, cards[i]!];
  }
  return cards;
}

export function isValidSet(a: SetCard, b: SetCard, c: SetCard): boolean {
  const attrs = ["color", "shape", "fill", "count"] as const;
  for (const attr of attrs) {
    const vals = new Set([a[attr], b[attr], c[attr]]);
    if (vals.size !== 1 && vals.size !== 3) return false;
  }
  return true;
}

function findSetOnTable(table: (SetCard | null)[]): [number, number, number] | null {
  const cards = table.map((c, i) => c ? { card: c, i } : null).filter(Boolean) as { card: SetCard; i: number }[];
  for (let a = 0; a < cards.length - 2; a++) {
    for (let b = a + 1; b < cards.length - 1; b++) {
      for (let c = b + 1; c < cards.length; c++) {
        if (isValidSet(cards[a]!.card, cards[b]!.card, cards[c]!.card)) {
          return [cards[a]!.i, cards[b]!.i, cards[c]!.i];
        }
      }
    }
  }
  return null;
}

function dealThree(deck: SetCard[], table: (SetCard | null)[]): { deck: SetCard[]; table: (SetCard | null)[] } {
  const newTable = [...table];
  let remaining = [...deck];
  // Fill empty slots
  for (let i = 0; i < newTable.length && remaining.length > 0; i++) {
    if (newTable[i] === null) {
      newTable[i] = remaining.shift()!;
    }
  }
  return { deck: remaining, table: newTable };
}

export function initialState(seed: number): SetState {
  const rng = mulberry32(seed);
  let deck = buildDeck(rng);
  let table: (SetCard | null)[] = Array(12).fill(null);
  const { deck: d, table: t } = dealThree(deck, table);
  deck = d;
  table = t;

  return {
    deck,
    table,
    selected: [],
    setsFound: 0,
    invalidSet: false,
    noSetOnTable: false,
    won: false,
    score: 0,
  };
}

export function reducer(state: SetState, action: SetAction): SetState {
  if (state.won) return state;

  if (action.type === "hint") {
    const set = findSetOnTable(state.table);
    if (!set) return { ...state, noSetOnTable: true };
    return { ...state, selected: [set[0]], noSetOnTable: false, invalidSet: false };
  }

  if (action.type === "selectCard") {
    const { tableIndex } = action;
    if (!state.table[tableIndex]) return state;

    let selected = [...state.selected];

    if (selected.includes(tableIndex)) {
      // Deselect
      selected = selected.filter(i => i !== tableIndex);
      return { ...state, selected, invalidSet: false, noSetOnTable: false };
    }

    selected = [...selected, tableIndex];

    if (selected.length < 3) {
      return { ...state, selected, invalidSet: false, noSetOnTable: false };
    }

    // Check set
    const [ai, bi, ci] = selected;
    const a = state.table[ai!];
    const b = state.table[bi!];
    const c = state.table[ci!];
    if (!a || !b || !c) return state;

    if (!isValidSet(a, b, c)) {
      return { ...state, selected: [], invalidSet: true, noSetOnTable: false };
    }

    // Valid set! Remove cards and replace
    const newTable: (SetCard | null)[] = [...state.table];
    for (const i of selected) newTable[i] = null;

    const setsFound = state.setsFound + 1;

    // Deal from deck to fill gaps
    let deck = [...state.deck];
    const filled: (SetCard | null)[] = [...newTable];
    if (deck.length > 0) {
      const { deck: d, table: t } = dealThree(deck, filled);
      deck = d;
      const table2 = t;
      // Check if any set exists
      const hasSet = findSetOnTable(table2) !== null;
      const cards = table2.filter(Boolean).length;
      const won = cards === 0 && deck.length === 0;
      const score = setsFound * 100;
      return { ...state, deck, table: table2, selected: [], setsFound, invalidSet: false, noSetOnTable: !hasSet && !won, won, score };
    } else {
      const hasSet = findSetOnTable(filled) !== null;
      const cards = filled.filter(Boolean).length;
      const won = cards === 0;
      const noSet = !hasSet && !won;
      const score = setsFound * 100;
      return { ...state, deck, table: filled, selected: [], setsFound, invalidSet: false, noSetOnTable: noSet, won, score };
    }
  }

  return state;
}

export function isTerminal(state: SetState): { score: number } | null {
  if (state.won) return { score: state.score };
  if (state.noSetOnTable && state.deck.length === 0) return { score: state.score };
  return null;
}
