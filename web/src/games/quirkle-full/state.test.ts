import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  isValidLine,
  validateAndScore,
  cpuChooseMove,
  keyOf,
  COLORS,
  SHAPES,
  COPIES_PER_TILE,
  HAND_SIZE,
  QWIRKLE_BONUS,
} from "./state.js";
import type {
  QwirkleSettings,
  Tile,
  Color,
  Shape,
  QwirkleState,
} from "./state.js";

const S: QwirkleSettings = { _dummy: false };

function t(color: Color, shape: Shape, id = 0): Tile {
  return { color, shape, id };
}

describe("quirkle-full", () => {
  it("initialState is deterministic by seed", () => {
    const a = initialState(42, S);
    const b = initialState(42, S);
    expect(a.players.map((p) => p.hand.map((h) => `${h.color}-${h.shape}`))).toEqual(
      b.players.map((p) => p.hand.map((h) => `${h.color}-${h.shape}`)),
    );
    expect(a.bag.length).toBe(b.bag.length);
  });

  it("initialState builds a 108-tile bag of 6 colors x 6 shapes x 3 copies", () => {
    const s = initialState(1, S);
    const dealt = s.players.reduce((sum, p) => sum + p.hand.length, 0);
    expect(dealt).toBe(HAND_SIZE * 3);
    expect(s.bag.length + dealt).toBe(
      COLORS.length * SHAPES.length * COPIES_PER_TILE,
    );
    expect(COLORS.length * SHAPES.length * COPIES_PER_TILE).toBe(108);
  });

  it("isTerminal returns null on fresh state", () => {
    const s = initialState(1, S);
    expect(isTerminal(s)).toBeNull();
  });

  it("each player starts with HAND_SIZE tiles, human seat first", () => {
    const s = initialState(7, S);
    expect(s.players.length).toBe(3);
    expect(s.players[0]!.isCpu).toBe(false);
    expect(s.players[1]!.isCpu).toBe(true);
    expect(s.players[2]!.isCpu).toBe(true);
    for (const p of s.players) expect(p.hand.length).toBe(HAND_SIZE);
  });

  it("isValidLine: same color, distinct shapes -> valid", () => {
    expect(isValidLine([t("red", "circle"), t("red", "square"), t("red", "diamond")])).toBe(true);
  });

  it("isValidLine: same shape, distinct colors -> valid", () => {
    expect(isValidLine([t("red", "circle"), t("blue", "circle"), t("green", "circle")])).toBe(true);
  });

  it("isValidLine: duplicate tile -> invalid", () => {
    expect(isValidLine([t("red", "circle"), t("red", "circle")])).toBe(false);
  });

  it("isValidLine: mixed color AND mixed shape -> invalid", () => {
    expect(isValidLine([t("red", "circle"), t("blue", "square")])).toBe(false);
  });

  it("isValidLine: length 7 -> invalid", () => {
    const line = [
      t("red", "circle"),
      t("red", "square"),
      t("red", "diamond"),
      t("red", "club"),
      t("red", "starburst"),
      t("red", "sparkle"),
      t("blue", "circle"),
    ];
    expect(isValidLine(line)).toBe(false);
  });

  it("validateAndScore: first move single tile at origin scores 1", () => {
    const board = {};
    const res = validateAndScore(board, [{ r: 0, c: 0, tile: t("red", "circle") }], true);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.score).toBe(1);
  });

  it("validateAndScore: first move 3-tile color line scores 3", () => {
    const board = {};
    const pending = [
      { r: 0, c: 0, tile: t("red", "circle", 1) },
      { r: 0, c: 1, tile: t("red", "square", 2) },
      { r: 0, c: 2, tile: t("red", "diamond", 3) },
    ];
    const res = validateAndScore(board, pending, true);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.score).toBe(3);
  });

  it("validateAndScore: completing a 6-tile line awards a Qwirkle bonus (+6)", () => {
    const board = {};
    const pending = [
      { r: 0, c: 0, tile: t("red", "circle", 1) },
      { r: 0, c: 1, tile: t("red", "square", 2) },
      { r: 0, c: 2, tile: t("red", "diamond", 3) },
      { r: 0, c: 3, tile: t("red", "club", 4) },
      { r: 0, c: 4, tile: t("red", "starburst", 5) },
      { r: 0, c: 5, tile: t("red", "sparkle", 6) },
    ];
    const res = validateAndScore(board, pending, true);
    expect(res.ok).toBe(true);
    // 6 tile-points + 6 Qwirkle bonus = 12
    if (res.ok) expect(res.score).toBe(6 + QWIRKLE_BONUS);
  });

  it("validateAndScore: rejects a non-line placement", () => {
    const board = {};
    const pending = [
      { r: 0, c: 0, tile: t("red", "circle", 1) },
      { r: 1, c: 1, tile: t("red", "square", 2) },
    ];
    const res = validateAndScore(board, pending, true);
    expect(res.ok).toBe(false);
  });

  it("validateAndScore: rejects extending into invalid match", () => {
    const board: Record<string, { tile: Tile }> = {};
    board[keyOf(0, 0)] = { tile: t("red", "circle", 1) };
    board[keyOf(0, 1)] = { tile: t("red", "square", 2) };
    // Try to add a blue square (mismatched color/shape with existing red line)
    const pending = [{ r: 0, c: 2, tile: t("blue", "square", 3) }];
    const res = validateAndScore(board, pending, false);
    expect(res.ok).toBe(false);
  });

  it("validateAndScore: accepts extending a valid color line", () => {
    const board: Record<string, { tile: Tile }> = {};
    board[keyOf(0, 0)] = { tile: t("red", "circle", 1) };
    board[keyOf(0, 1)] = { tile: t("red", "square", 2) };
    const pending = [{ r: 0, c: 2, tile: t("red", "diamond", 3) }];
    const res = validateAndScore(board, pending, false);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.score).toBe(3); // the 3-tile line
  });

  it("validateAndScore: requires touching existing tile when board non-empty", () => {
    const board: Record<string, { tile: Tile }> = {};
    board[keyOf(0, 0)] = { tile: t("red", "circle", 1) };
    const pending = [{ r: 5, c: 5, tile: t("blue", "square", 2) }];
    const res = validateAndScore(board, pending, false);
    expect(res.ok).toBe(false);
  });

  it("selectHand updates selectedHandIdx; out-of-range ignored", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "selectHand", idx: 0 });
    expect(s2.selectedHandIdx).toBe(0);
    const s3 = reducer(s2, { type: "selectHand", idx: 99 });
    expect(s3).toBe(s2);
  });

  it("placeTile without selection is a no-op (returns same state ref)", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "placeTile", r: 0, c: 0 });
    expect(s2).toBe(s);
  });

  it("placeTile then recallAll round-trips", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "selectHand", idx: 0 });
    s = reducer(s, { type: "placeTile", r: 0, c: 0 });
    expect(s.pending.length).toBe(1);
    s = reducer(s, { type: "recallAll" });
    expect(s.pending.length).toBe(0);
    expect(s.selectedHandIdx).toBeNull();
  });

  it("submit with empty pending is a no-op", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "submit" });
    expect(s2).toBe(s);
  });

  it("submit places a tile, advances turn to CPU, refills hand to 6", () => {
    let s = initialState(123, S);
    s = reducer(s, { type: "selectHand", idx: 0 });
    s = reducer(s, { type: "placeTile", r: 0, c: 0 });
    s = reducer(s, { type: "submit" });
    // Turn moved to next player
    expect(s.currentPlayer).toBe(1);
    // Human hand refilled
    expect(s.players[0]!.hand.length).toBe(HAND_SIZE);
    // Board now has the placed tile
    expect(Object.keys(s.board).length).toBe(1);
    // Score is at least 1
    expect(s.players[0]!.score).toBeGreaterThanOrEqual(1);
  });

  it("cpuChooseMove finds a placement on the opening (any tile works)", () => {
    const s = initialState(5, S);
    const move = cpuChooseMove(s, 0); // CPU strategy as if seat 0 were CPU
    expect(move).not.toBeNull();
    if (move) expect(move.pending.length).toBeGreaterThan(0);
  });

  it("game ends when bag empty AND a player out of tiles; isTerminal returns score>=0", () => {
    // Manually craft a near-end state
    let s = initialState(1, S);
    // Force board to have one tile, bag empty, human hand empty after submit
    s = {
      ...s,
      bag: [],
      board: { [keyOf(5, 5)]: { tile: t("blue", "circle", 99) } },
      players: s.players.map((p, i) =>
        i === 0
          ? { ...p, hand: [t("blue", "square", 100)] } // one tile in human hand
          : p,
      ),
      currentPlayer: 0,
      bounds: { rMin: 5, rMax: 5, cMin: 5, cMax: 5 },
    } as QwirkleState;
    // Select & place the tile next to (5,5) — extends a blue line
    s = reducer(s, { type: "selectHand", idx: 0 });
    s = reducer(s, { type: "placeTile", r: 5, c: 6 });
    s = reducer(s, { type: "submit" });
    expect(s.phase).toBe("done");
    const term = isTerminal(s);
    expect(term).not.toBeNull();
    expect(term!.score).toBeGreaterThanOrEqual(0);
  });

  it("swap exchanges tiles and advances turn", () => {
    const s = initialState(99, S);
    const before = s.players[0]!.hand.map((h) => `${h.color}-${h.shape}-${h.id}`).join("|");
    const s2 = reducer(s, { type: "swap", idxs: [0, 1, 2] });
    expect(s2.currentPlayer).toBe(1);
    const after = s2.players[0]!.hand.map((h) => `${h.color}-${h.shape}-${h.id}`).join("|");
    expect(after).not.toBe(before);
    expect(s2.players[0]!.hand.length).toBe(HAND_SIZE);
  });

  it("reducer ignores human actions when it's a CPU's turn", () => {
    const s0 = initialState(1, S);
    const s1: QwirkleState = { ...s0, currentPlayer: 1 };
    const s2 = reducer(s1, { type: "selectHand", idx: 0 });
    expect(s2).toBe(s1);
    const s3 = reducer(s1, { type: "submit" });
    expect(s3).toBe(s1);
  });
});
