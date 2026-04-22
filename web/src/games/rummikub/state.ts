import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type TileColor = "red" | "blue" | "orange" | "black";
export interface Tile {
  id: number;
  num: number; // 1-13, 0 = joker
  color: TileColor | "joker";
}

export interface RummikubSettings {
  botCount: "1" | "2";
}

export type MeldGroup = Tile[];

export interface RummikubState {
  settings: RummikubSettings;
  rngSeed: number;
  hand: Tile[];
  table: MeldGroup[];
  pool: Tile[]; // remaining draw pile
  botHands: Tile[][];
  turn: number; // 0 = player, 1..N = bots
  selectedTileIds: number[];
  gameOver: boolean;
  winner: "player" | "bot" | null;
  message: string;
  drawsThisTurn: number;
}

export type RummikubAction =
  | { type: "toggle-tile"; id: number }
  | { type: "meld" } // place selected tiles as a meld
  | { type: "draw" } // draw a tile (pass if pool empty)
  | { type: "end-turn" }
  | { type: "restart" };

const COLORS: TileColor[] = ["red", "blue", "orange", "black"];

function createDeck(): Tile[] {
  const tiles: Tile[] = [];
  let id = 0;
  // Two sets of 1-13 × 4 colors
  for (let set = 0; set < 2; set++) {
    for (const color of COLORS) {
      for (let num = 1; num <= 13; num++) {
        tiles.push({ id: id++, num, color });
      }
    }
  }
  // 2 jokers
  tiles.push({ id: id++, num: 0, color: "joker" });
  tiles.push({ id: id++, num: 0, color: "joker" });
  return tiles;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function isValidMeld(tiles: Tile[]): boolean {
  if (tiles.length < 3) return false;

  const nonJokers = tiles.filter((t) => t.color !== "joker");

  // Check: group (same number, different colors)
  if (nonJokers.length === 0 || nonJokers.every((t) => t.num === nonJokers[0]!.num)) {
    const colors = new Set(nonJokers.map((t) => t.color));
    if (colors.size === nonJokers.length && tiles.length <= 4) return true;
  }

  // Check: run (consecutive numbers, same color)
  const color = nonJokers[0]?.color;
  if (color && nonJokers.every((t) => t.color === color)) {
    // Sort by number (fill jokers)
    const sorted = [...tiles].sort((a, b) => {
      const an = a.color === "joker" ? -1 : a.num;
      const bn = b.color === "joker" ? -1 : b.num;
      return an - bn;
    });
    // Find the numbers with joker gaps
    let expectedNum = nonJokers.map((t) => t.num).sort((a, b) => a - b)[0]!;
    let jokerCount = tiles.filter((t) => t.color === "joker").length;
    const nums = nonJokers.map((t) => t.num).sort((a, b) => a - b);
    let ok = true;
    for (let i = 0; i < nums.length - 1; i++) {
      const gap = nums[i + 1]! - nums[i]! - 1;
      if (gap > 0) jokerCount -= gap;
      if (jokerCount < 0) { ok = false; break; }
    }
    if (ok) return true;
    void sorted; void expectedNum;
  }

  return false;
}

function botFindMelds(hand: Tile[]): MeldGroup[] {
  // Very simple: find groups (same number, different colors)
  const byNumber: Record<number, Tile[]> = {};
  for (const t of hand) {
    if (t.color === "joker") continue;
    byNumber[t.num] = [...(byNumber[t.num] ?? []), t];
  }

  const melds: MeldGroup[] = [];
  for (const tiles of Object.values(byNumber)) {
    if (tiles.length >= 3) {
      // Pick 3-4 unique colors
      const unique: Tile[] = [];
      const seen = new Set<TileColor>();
      for (const t of tiles) {
        if (!seen.has(t.color as TileColor) && unique.length < 4) {
          seen.add(t.color as TileColor);
          unique.push(t);
        }
      }
      if (unique.length >= 3) melds.push(unique);
    }
  }
  return melds;
}

export function initialState(seed: number, settings: RummikubSettings): RummikubState {
  const rng = mulberry32(seed);
  const numBots = parseInt(settings.botCount, 10);
  const deck = shuffle(createDeck(), rng);

  let idx = 0;
  const hand = deck.slice(idx, idx + 14); idx += 14;
  const botHands: Tile[][] = [];
  for (let b = 0; b < numBots; b++) {
    botHands.push(deck.slice(idx, idx + 14));
    idx += 14;
  }
  const pool = deck.slice(idx);

  return {
    settings,
    rngSeed: seed,
    hand,
    table: [],
    pool,
    botHands,
    turn: 0,
    selectedTileIds: [],
    gameOver: false,
    winner: null,
    message: "Your turn! Select tiles to meld or draw a tile.",
    drawsThisTurn: 0,
  };
}

function botTurn(state: RummikubState, botIdx: number): RummikubState {
  let botHand = [...state.botHands[botIdx - 1]!];
  const melds = botFindMelds(botHand);
  const table = [...state.table];

  let playedSomething = false;
  for (const meld of melds) {
    const meldIds = new Set(meld.map((t) => t.id));
    botHand = botHand.filter((t) => !meldIds.has(t.id));
    table.push(meld);
    playedSomething = true;
  }

  const botHands = [...state.botHands];
  botHands[botIdx - 1] = botHand;

  // Check bot win
  if (botHand.length === 0) {
    return {
      ...state,
      botHands,
      table,
      gameOver: true,
      winner: "bot",
      turn: botIdx,
      message: `Bot ${botIdx} plays all tiles and wins!`,
    };
  }

  // Bot draws if no play
  let pool = [...state.pool];
  if (!playedSomething && pool.length > 0) {
    const drawn = pool.shift()!;
    botHands[botIdx - 1] = [...botHands[botIdx - 1]!, drawn];
  }

  // Next turn
  const numBots = parseInt(state.settings.botCount, 10);
  const nextTurn = botIdx >= numBots ? 0 : botIdx + 1;
  const nextMsg = nextTurn === 0 ? "Your turn!" : `Bot ${nextTurn} is thinking...`;

  let nextState: RummikubState = {
    ...state,
    botHands,
    table,
    pool,
    turn: nextTurn,
    message: nextMsg,
    selectedTileIds: [],
    drawsThisTurn: 0,
  };

  // Auto-advance bots
  if (nextTurn !== 0) {
    nextState = botTurn(nextState, nextTurn);
  }

  return nextState;
}

export function reducer(state: RummikubState, action: RummikubAction): RummikubState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);

  if (state.gameOver) return state;
  if (state.turn !== 0) return state; // shouldn't happen in UI, but guard

  if (action.type === "toggle-tile") {
    const { id } = action;
    const sel = state.selectedTileIds.includes(id)
      ? state.selectedTileIds.filter((x) => x !== id)
      : [...state.selectedTileIds, id];
    return { ...state, selectedTileIds: sel };
  }

  if (action.type === "meld") {
    const tiles = state.selectedTileIds.map((id) => state.hand.find((t) => t.id === id)!).filter(Boolean);
    if (!isValidMeld(tiles)) {
      return { ...state, message: "Invalid meld! Need 3+ tiles: same number (different colors) or consecutive (same color)." };
    }

    const meldIds = new Set(state.selectedTileIds);
    const newHand = state.hand.filter((t) => !meldIds.has(t.id));
    const newTable = [...state.table, tiles];

    // Check player win
    if (newHand.length === 0) {
      return { ...state, hand: newHand, table: newTable, selectedTileIds: [], gameOver: true, winner: "player", message: "You played all your tiles — you win!" };
    }

    return { ...state, hand: newHand, table: newTable, selectedTileIds: [], message: "Meld placed! Continue or end turn." };
  }

  if (action.type === "draw") {
    if (state.pool.length === 0) {
      return { ...state, message: "Pool is empty!" };
    }
    const pool = [...state.pool];
    const drawn = pool.shift()!;
    return {
      ...state,
      hand: [...state.hand, drawn],
      pool,
      drawsThisTurn: state.drawsThisTurn + 1,
      message: `Drew a tile: ${drawn.num} ${drawn.color}. End your turn.`,
    };
  }

  if (action.type === "end-turn") {
    // Move to bot(s)
    const numBots = parseInt(state.settings.botCount, 10);
    if (numBots === 0) return state;

    let nextState: RummikubState = {
      ...state,
      turn: 1,
      selectedTileIds: [],
      drawsThisTurn: 0,
      message: "Bot 1 is thinking...",
    };
    nextState = botTurn(nextState, 1);
    return nextState;
  }

  return state;
}

export function isTerminal(state: RummikubState): { score: number } | null {
  if (!state.gameOver) return null;
  if (state.winner === "player") {
    // Score based on tiles in opponent hands
    const opponentTiles = state.botHands.flat().reduce((sum, t) => sum + Math.min(t.num, 30), 0);
    return { score: Math.max(50, opponentTiles) };
  }
  return { score: 0 };
}
