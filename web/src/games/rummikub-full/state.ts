import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/* ---------- Types ---------- */

export type TileColor = "red" | "blue" | "orange" | "black";
export type TileKind = TileColor | "joker";

export interface Tile {
  id: number;
  num: number; // 1-13; jokers carry num = 0
  color: TileKind;
}

export type Meld = Tile[];

export type Phase = "play" | "gameover";

export interface RummikubFullSettings {
  /** Cosmetic-only; the full rulebook fixes the table at 4 players. */
  _dummy: "ok";
}

export interface RummikubFullState {
  settings: RummikubFullSettings;
  rngSeed: number;

  /** seat 0 = human, seats 1-3 = CPUs */
  hands: Tile[][];
  table: Meld[];
  /** committed snapshot of the table at the start of the human's turn,
   *  used to roll back illegal rearrangements. */
  tableCommitted: Meld[];
  /** committed snapshot of the human's hand at the start of their turn. */
  handCommitted: Tile[];
  pool: Tile[];

  /** True once the player has placed their initial meld (≥30 face value
   *  in a single turn). One flag per seat. */
  opened: boolean[];

  /** Whose turn it is. */
  turn: number; // 0..3
  /** Selected tile IDs in the human's hand (for forming a new meld). */
  selectedHandIds: number[];
  /** Selected tile IDs already on the table (for rearranging). */
  selectedTableIds: number[];

  phase: Phase;
  /** seat index of the winner, or -1 if the pool dried out (stalemate). */
  winner: number;
  message: string;

  /** Consecutive passes since last successful play; if it hits 4 with an
   *  empty pool we stalemate-score everyone. */
  passStreak: number;
}

export type RummikubFullAction =
  | { type: "toggle-hand"; id: number }
  | { type: "toggle-table"; id: number }
  /** Place the currently selected hand tiles as a brand-new meld on the
   *  table. Tiles must already form a single valid run or group. */
  | { type: "place-new-meld" }
  /** Combine the currently selected table-tile selection plus the currently
   *  selected hand-tile selection into a new meld. The selected table tiles
   *  are removed from their current melds (which must remain valid if any
   *  fragments remain). Lets you rearrange/extend the tableau. */
  | { type: "merge-selection" }
  /** Commit the current pending table layout. Validates: every meld is
   *  legal, at least one tile from hand was played, and (if not yet open)
   *  the tiles played this turn total ≥30 face value. */
  | { type: "commit" }
  /** Undo any pending changes and revert to the start-of-turn snapshot. */
  | { type: "reset-turn" }
  /** Draw a tile from the pouch — ends the turn immediately. */
  | { type: "draw" }
  | { type: "restart" };

/* ---------- Deck ---------- */

const COLORS: TileColor[] = ["red", "blue", "orange", "black"];

function createDeck(): Tile[] {
  const tiles: Tile[] = [];
  let id = 0;
  // 1-13 in 4 colors × 2 copies = 104 numbered tiles
  for (let copy = 0; copy < 2; copy++) {
    for (const color of COLORS) {
      for (let num = 1; num <= 13; num++) tiles.push({ id: id++, num, color });
    }
  }
  // 2 jokers
  tiles.push({ id: id++, num: 0, color: "joker" });
  tiles.push({ id: id++, num: 0, color: "joker" });
  return tiles;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

/* ---------- Meld validation ---------- */

/** Return the run-or-group orientation of `tiles` (3-13 length) or null. */
export function meldKind(tiles: Tile[]): "run" | "group" | null {
  if (tiles.length < 3 || tiles.length > 13) return null;
  const nonJokers = tiles.filter((t) => t.color !== "joker");
  if (nonJokers.length === 0) return null; // all-joker meld disallowed

  // ---- Group: same number, distinct colors, length 3 or 4 ----
  if (tiles.length <= 4) {
    const num = nonJokers[0]!.num;
    if (nonJokers.every((t) => t.num === num)) {
      const colors = new Set(nonJokers.map((t) => t.color));
      if (colors.size === nonJokers.length) return "group";
    }
  }

  // ---- Run: same color, consecutive numbers ----
  const color = nonJokers[0]!.color;
  if (nonJokers.every((t) => t.color === color)) {
    // Try to assign joker positions so that nonJoker numbers fit into
    // a consecutive range of length tiles.length, all within 1..13.
    const nums = nonJokers.map((t) => t.num).sort((a, b) => a - b);
    // duplicates not allowed in a run
    for (let i = 1; i < nums.length; i++) if (nums[i] === nums[i - 1]) return null;
    const jokers = tiles.length - nonJokers.length;
    const span = nums[nums.length - 1]! - nums[0]! + 1;
    if (span > tiles.length) return null;
    // Total run length is tiles.length; the run's lowest number must
    // sit somewhere between max(1, last - L + 1) and nums[0].
    const len = tiles.length;
    const lo = Math.max(1, nums[nums.length - 1]! - len + 1);
    const hi = Math.min(nums[0]!, 13 - len + 1);
    for (let start = lo; start <= hi; start++) {
      const end = start + len - 1;
      if (end > 13) continue;
      // Count gaps inside [start..end] that aren't filled by a real tile;
      // those must be covered by jokers.
      let needed = 0;
      for (let n = start; n <= end; n++) {
        if (!nums.includes(n)) needed++;
      }
      if (needed === jokers) return "run";
    }
  }
  return null;
}

export function isValidMeld(tiles: Tile[]): boolean {
  return meldKind(tiles) !== null;
}

/** Face value of a tile when scoring (jokers are 30 in hand at end of game). */
function tileValue(t: Tile, jokerWeight: number): number {
  if (t.color === "joker") return jokerWeight;
  return t.num;
}

/** Sum the face values of `tiles` for the initial-meld-≥30 check. Jokers
 *  in an initial meld score whatever they stand in for. We approximate
 *  by treating a joker as the most natural in-meld value (the missing
 *  slot in a run, or the matching number in a group). For simplicity
 *  we walk the meld kind. */
function meldFaceValue(tiles: Tile[]): number {
  const kind = meldKind(tiles);
  if (!kind) return 0;
  const nonJokers = tiles.filter((t) => t.color !== "joker");
  const jokerCount = tiles.length - nonJokers.length;
  if (kind === "group") {
    // every tile, joker included, scores as the group's number
    const num = nonJokers[0]!.num;
    return num * tiles.length;
  }
  // run: figure out the start..end range and sum it
  const nums = nonJokers.map((t) => t.num).sort((a, b) => a - b);
  const len = tiles.length;
  const lo = Math.max(1, nums[nums.length - 1]! - len + 1);
  const hi = Math.min(nums[0]!, 13 - len + 1);
  for (let start = lo; start <= hi; start++) {
    const end = start + len - 1;
    if (end > 13) continue;
    let needed = 0;
    for (let n = start; n <= end; n++) if (!nums.includes(n)) needed++;
    if (needed === jokerCount) {
      let sum = 0;
      for (let n = start; n <= end; n++) sum += n;
      return sum;
    }
  }
  return 0;
}

/** Sum face values of an arbitrary tile list (jokers cost `jokerWeight`). */
export function tilesFaceValue(tiles: Tile[], jokerWeight = 0): number {
  return tiles.reduce((s, t) => s + tileValue(t, jokerWeight), 0);
}

/* ---------- CPU heuristics ---------- */

/** Find one set of disjoint hand-only melds. Greedy. */
function findHandMelds(hand: Tile[]): Meld[] {
  const out: Meld[] = [];
  let pool = hand.slice();

  // First pass: groups (same number, distinct colors).
  const byNum: Record<number, Tile[]> = {};
  for (const t of pool) {
    if (t.color === "joker") continue;
    (byNum[t.num] ??= []).push(t);
  }
  for (const num of Object.keys(byNum).map(Number)) {
    const tiles = byNum[num]!;
    const uniqueColors: Tile[] = [];
    const seen = new Set<TileKind>();
    for (const t of tiles) {
      if (!seen.has(t.color)) {
        seen.add(t.color);
        uniqueColors.push(t);
      }
      if (uniqueColors.length === 4) break;
    }
    if (uniqueColors.length >= 3) {
      out.push(uniqueColors);
      const usedIds = new Set(uniqueColors.map((t) => t.id));
      pool = pool.filter((t) => !usedIds.has(t.id));
    }
  }

  // Second pass: runs per color.
  for (const color of COLORS) {
    const sameColor = pool.filter((t) => t.color === color).sort((a, b) => a.num - b.num);
    let i = 0;
    while (i < sameColor.length) {
      let j = i + 1;
      const run = [sameColor[i]!];
      while (j < sameColor.length && sameColor[j]!.num === run[run.length - 1]!.num + 1) {
        run.push(sameColor[j]!);
        j++;
      }
      if (run.length >= 3) {
        out.push(run);
        const usedIds = new Set(run.map((t) => t.id));
        pool = pool.filter((t) => !usedIds.has(t.id));
      }
      i = j;
    }
  }

  return out;
}

/** Try simple rearrangements: place a hand tile onto an existing meld
 *  if it extends/splits cleanly. Returns the modified table and the
 *  list of hand-tile IDs consumed. */
function tryExtendTable(hand: Tile[], table: Meld[]): { table: Meld[]; consumedIds: number[] } {
  let newTable = table.map((m) => m.slice());
  const consumedIds: number[] = [];
  const handCopy = hand.slice();

  let changed = true;
  while (changed) {
    changed = false;
    for (let mi = 0; mi < newTable.length; mi++) {
      const meld = newTable[mi]!;
      const kind = meldKind(meld);
      if (!kind) continue;

      // Try appending each hand tile to this meld.
      for (let hi = 0; hi < handCopy.length; hi++) {
        const t = handCopy[hi]!;
        const candidate = [...meld, t];
        if (isValidMeld(candidate)) {
          newTable[mi] = candidate;
          consumedIds.push(t.id);
          handCopy.splice(hi, 1);
          changed = true;
          break;
        }
      }
    }
  }

  return { table: newTable, consumedIds };
}

/** Plan a CPU move: pure function over a frozen state. */
function planCpuMove(
  hand: Tile[],
  table: Meld[],
  opened: boolean,
): { table: Meld[]; hand: Tile[]; opened: boolean; played: boolean } {
  // 1) Find hand-only melds.
  const handMelds = findHandMelds(hand);
  let newTable = table.map((m) => m.slice());
  let newHand = hand.slice();
  let newOpened = opened;
  let played = false;

  if (!newOpened) {
    // Initial-meld rule: must play ≥30 face value, hand-only.
    const total = handMelds.reduce((s, m) => s + meldFaceValue(m), 0);
    if (total >= 30) {
      for (const m of handMelds) {
        const ids = new Set(m.map((t) => t.id));
        newHand = newHand.filter((t) => !ids.has(t.id));
        newTable.push(m);
        played = true;
      }
      newOpened = true;
    }
  } else {
    for (const m of handMelds) {
      const ids = new Set(m.map((t) => t.id));
      newHand = newHand.filter((t) => !ids.has(t.id));
      newTable.push(m);
      played = true;
    }
    // 2) Simple table extensions (only after opening).
    const ext = tryExtendTable(newHand, newTable);
    if (ext.consumedIds.length > 0) {
      const consumed = new Set(ext.consumedIds);
      newHand = newHand.filter((t) => !consumed.has(t.id));
      newTable = ext.table;
      played = true;
    }
  }

  return { table: newTable, hand: newHand, opened: newOpened, played };
}

/* ---------- Initial state ---------- */

export function initialState(seed: number, settings: RummikubFullSettings): RummikubFullState {
  const rng = mulberry32(seed >>> 0);
  const deck = shuffle(createDeck(), rng);

  const hands: Tile[][] = [[], [], [], []];
  let idx = 0;
  for (let s = 0; s < 4; s++) {
    hands[s] = deck.slice(idx, idx + 14);
    idx += 14;
  }
  const pool = deck.slice(idx);

  return {
    settings,
    rngSeed: seed,
    hands,
    table: [],
    tableCommitted: [],
    handCommitted: hands[0]!.slice(),
    pool,
    opened: [false, false, false, false],
    turn: 0,
    selectedHandIds: [],
    selectedTableIds: [],
    phase: "play",
    winner: -1,
    message: "Your turn. Open with a meld worth at least 30 points.",
    passStreak: 0,
  };
}

/* ---------- Reducer ---------- */

function advanceTurn(state: RummikubFullState): RummikubFullState {
  // Move turn 0→1→2→3→0; auto-run CPU turns.
  let cur: RummikubFullState = {
    ...state,
    turn: (state.turn + 1) % 4,
    selectedHandIds: [],
    selectedTableIds: [],
  };

  let safety = 8;
  while (cur.phase === "play" && cur.turn !== 0 && safety-- > 0) {
    cur = runCpuTurn(cur, cur.turn);
    if (cur.phase === "gameover") return cur;
    cur = {
      ...cur,
      turn: (cur.turn + 1) % 4,
      selectedHandIds: [],
      selectedTableIds: [],
    };
  }

  // Now it's the human's turn — snapshot for rollback.
  if (cur.phase === "play" && cur.turn === 0) {
    cur = {
      ...cur,
      tableCommitted: cur.table.map((m) => m.slice()),
      handCommitted: cur.hands[0]!.slice(),
      message: cur.opened[0]
        ? "Your turn. Play tiles or draw."
        : "Your turn. Open with a meld worth at least 30 points.",
    };
  }
  return cur;
}

function runCpuTurn(state: RummikubFullState, seat: number): RummikubFullState {
  const hand = state.hands[seat]!;
  const plan = planCpuMove(hand, state.table, state.opened[seat]!);

  const hands = state.hands.slice();
  hands[seat] = plan.hand;
  const opened = state.opened.slice();
  opened[seat] = plan.opened;

  if (plan.played) {
    // Win check
    if (hands[seat]!.length === 0) {
      return {
        ...state,
        hands,
        table: plan.table,
        opened,
        phase: "gameover",
        winner: seat,
        message: `CPU ${seat} played their last tile and wins.`,
        passStreak: 0,
      };
    }
    return {
      ...state,
      hands,
      table: plan.table,
      opened,
      message: `CPU ${seat} played some tiles.`,
      passStreak: 0,
    };
  }

  // CPU draws if it cannot play.
  let pool = state.pool;
  if (pool.length > 0) {
    pool = pool.slice();
    const drawn = pool.shift()!;
    hands[seat] = [...hands[seat]!, drawn];
    return {
      ...state,
      hands,
      pool,
      message: `CPU ${seat} drew a tile.`,
      passStreak: state.passStreak + 1,
    };
  }

  // No play and no pool — pass.
  const passStreak = state.passStreak + 1;
  if (passStreak >= 4) {
    return {
      ...state,
      hands,
      phase: "gameover",
      winner: -1,
      message: "Pouch is empty and no one can play.",
      passStreak,
    };
  }
  return { ...state, hands, message: `CPU ${seat} passes.`, passStreak };
}

/** Compute tiles played from hand this turn by diffing pending table
 *  vs handCommitted. Tiles that left the hand AND now appear on the
 *  table were played from hand. */
function tilesPlayedThisTurn(state: RummikubFullState): Tile[] {
  const beforeIds = new Set(state.handCommitted.map((t) => t.id));
  const tableIds = new Set(state.table.flat().map((t) => t.id));
  const handIds = new Set(state.hands[0]!.map((t) => t.id));
  // played = (in committed-hand) AND (currently on table) AND (NOT still in hand)
  const played: Tile[] = [];
  for (const t of state.handCommitted) {
    if (tableIds.has(t.id) && !handIds.has(t.id)) played.push(t);
  }
  // tiles in tableCommitted that disappeared (e.g. jokers retrieved) don't
  // count as played-from-hand.
  void beforeIds;
  return played;
}

export function reducer(state: RummikubFullState, action: RummikubFullAction): RummikubFullState {
  if (action.type === "restart") {
    return initialState(state.rngSeed + 1, state.settings);
  }
  if (state.phase === "gameover") return state;
  if (state.turn !== 0) return state; // CPU turns are auto-driven

  if (action.type === "toggle-hand") {
    const sel = state.selectedHandIds.includes(action.id)
      ? state.selectedHandIds.filter((x) => x !== action.id)
      : [...state.selectedHandIds, action.id];
    return { ...state, selectedHandIds: sel };
  }

  if (action.type === "toggle-table") {
    const sel = state.selectedTableIds.includes(action.id)
      ? state.selectedTableIds.filter((x) => x !== action.id)
      : [...state.selectedTableIds, action.id];
    return { ...state, selectedTableIds: sel };
  }

  if (action.type === "reset-turn") {
    return {
      ...state,
      table: state.tableCommitted.map((m) => m.slice()),
      hands: state.hands.map((h, i) => (i === 0 ? state.handCommitted.slice() : h)),
      selectedHandIds: [],
      selectedTableIds: [],
      message: state.opened[0]
        ? "Pending changes cleared. Play tiles or draw."
        : "Pending changes cleared. Open with ≥30 points or draw.",
    };
  }

  if (action.type === "place-new-meld") {
    const tiles = state.selectedHandIds
      .map((id) => state.hands[0]!.find((t) => t.id === id))
      .filter((t): t is Tile => Boolean(t));
    if (tiles.length === 0 || !isValidMeld(tiles)) {
      return { ...state, message: "Select 3+ hand tiles that form a run or group." };
    }
    const ids = new Set(tiles.map((t) => t.id));
    const newHand = state.hands[0]!.filter((t) => !ids.has(t.id));
    const newHands = state.hands.slice();
    newHands[0] = newHand;
    return {
      ...state,
      hands: newHands,
      table: [...state.table, tiles],
      selectedHandIds: [],
      message: "Meld added. Commit to end your turn or keep playing.",
    };
  }

  if (action.type === "merge-selection") {
    // Gather selected hand tiles + selected table tiles.
    const handTiles = state.selectedHandIds
      .map((id) => state.hands[0]!.find((t) => t.id === id))
      .filter((t): t is Tile => Boolean(t));

    const tableTileMap = new Map<number, Tile>();
    for (const meld of state.table) for (const t of meld) tableTileMap.set(t.id, t);
    const tableTiles = state.selectedTableIds
      .map((id) => tableTileMap.get(id))
      .filter((t): t is Tile => Boolean(t));

    const merged = [...tableTiles, ...handTiles];
    if (!isValidMeld(merged)) {
      return { ...state, message: "That combination isn't a valid run or group." };
    }

    // Remove the selected table tiles from their existing melds; any meld
    // that loses tiles must remain a valid meld or be deleted entirely.
    const removeIds = new Set(state.selectedTableIds);
    const remainingMelds: Meld[] = [];
    for (const meld of state.table) {
      const left = meld.filter((t) => !removeIds.has(t.id));
      if (left.length === 0) continue;
      if (left.length === meld.length) {
        remainingMelds.push(left);
        continue;
      }
      // Fragment of an existing meld — must still be valid.
      if (!isValidMeld(left)) {
        return { ...state, message: "That move would break a meld on the table." };
      }
      remainingMelds.push(left);
    }

    // Remove hand tiles.
    const handIds = new Set(state.selectedHandIds);
    const newHand = state.hands[0]!.filter((t) => !handIds.has(t.id));
    const newHands = state.hands.slice();
    newHands[0] = newHand;

    return {
      ...state,
      hands: newHands,
      table: [...remainingMelds, merged],
      selectedHandIds: [],
      selectedTableIds: [],
      message: "Tiles merged. Commit to end your turn or keep playing.",
    };
  }

  if (action.type === "draw") {
    if (state.pool.length === 0) {
      // No tiles, just pass.
      return advanceTurn({
        ...state,
        // restore any in-flight changes (drawing forfeits this turn's work)
        table: state.tableCommitted.map((m) => m.slice()),
        hands: state.hands.map((h, i) => (i === 0 ? state.handCommitted.slice() : h)),
        passStreak: state.passStreak + 1,
        message: "Pouch is empty. You pass.",
      });
    }
    const pool = state.pool.slice();
    const drawn = pool.shift()!;
    const newHands = state.hands.slice();
    // Drawing forces a clean turn (revert any pending plays first).
    newHands[0] = [...state.handCommitted, drawn];
    return advanceTurn({
      ...state,
      hands: newHands,
      table: state.tableCommitted.map((m) => m.slice()),
      pool,
      passStreak: state.passStreak + 1,
      message: `You drew a tile.`,
    });
  }

  if (action.type === "commit") {
    // Validate that every meld currently on the table is legal.
    for (const meld of state.table) {
      if (!isValidMeld(meld)) {
        return {
          ...state,
          message: "Some melds on the table aren't valid yet.",
        };
      }
    }
    const played = tilesPlayedThisTurn(state);
    if (played.length === 0) {
      return {
        ...state,
        message: "You must play at least one tile from your hand.",
      };
    }
    if (!state.opened[0]) {
      // Initial meld: the tiles you played (from hand) must total ≥30
      // face value, AND those tiles must form a meld (or chain of melds)
      // by themselves — no leaning on the table.
      // Simplified check: total face value ≥ 30.
      const total = played.reduce((s, t) => s + (t.color === "joker" ? 30 : t.num), 0);
      if (total < 30) {
        return {
          ...state,
          message: `Initial meld must total ≥30. You played ${total}.`,
        };
      }
    }

    const opened = state.opened.slice();
    opened[0] = true;

    // Win check
    if (state.hands[0]!.length === 0) {
      return {
        ...state,
        opened,
        phase: "gameover",
        winner: 0,
        message: "You played your last tile and won the hand!",
      };
    }

    return advanceTurn({
      ...state,
      opened,
      passStreak: 0,
      message: "Turn committed.",
    });
  }

  return state;
}

/* ---------- Terminal scoring ---------- */

export function isTerminal(state: RummikubFullState): { score: number } | null {
  if (state.phase !== "gameover") return null;
  if (state.winner === 0) {
    // Win score = sum of opponent tile values - 0 (your hand is empty).
    let score = 0;
    for (let s = 1; s < 4; s++) {
      for (const t of state.hands[s]!) {
        score += t.color === "joker" ? 30 : t.num;
      }
    }
    return { score: Math.max(1, score) };
  }
  // Loss / stalemate.
  return { score: 0 };
}
