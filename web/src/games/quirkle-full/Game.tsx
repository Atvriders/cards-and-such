import { useEffect, useMemo, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  QwirkleState,
  QwirkleAction,
  QwirkleSettings,
  Tile,
  Color,
  Shape,
} from "./state.js";
import { isTerminal, keyOf } from "./state.js";
import "./Game.css";

function shapeGlyph(shape: Shape): string {
  // Unicode glyphs as a fallback when the tile renders. The actual visual
  // styling uses a span class for the shape.
  switch (shape) {
    case "circle":
      return "●";
    case "square":
      return "■";
    case "diamond":
      return "◆";
    case "club":
      return "♣";
    case "starburst":
      return "✦";
    case "sparkle":
      return "❇";
  }
}

function colorHex(color: Color): string {
  switch (color) {
    case "red":
      return "#d83a3a";
    case "orange":
      return "#e98a25";
    case "yellow":
      return "#f0c83a";
    case "green":
      return "#3aa84b";
    case "blue":
      return "#3b6fd6";
    case "purple":
      return "#8a4ad0";
  }
}

function TileGlyph({ tile, size }: { tile: Tile; size: number }): JSX.Element {
  const ch = shapeGlyph(tile.shape);
  return (
    <span
      className="qf-glyph"
      style={{ color: colorHex(tile.color), fontSize: `${size}px`, lineHeight: 1 }}
      aria-hidden="true"
    >
      {ch}
    </span>
  );
}

export function QwirkleFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<QwirkleState, QwirkleSettings>): JSX.Element {
  const endedRef = useRef(false);

  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Drive CPU turns
  useEffect(() => {
    const current = state.players[state.currentPlayer];
    if (current && current.isCpu && state.phase === "playing") {
      const id = window.setTimeout(
        () => dispatch({ type: "cpuTurn" } as QwirkleAction),
        500,
      );
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [state.currentPlayer, state.phase, state.players, dispatch]);

  const terminal = isTerminal(state);
  const human = state.players[0]!;
  const isHumanTurn = state.currentPlayer === 0 && !terminal;

  // Compute display bounds; pad by 1 cell so player can place adjacent on edges
  const displayBounds = useMemo(() => {
    const pad = 1;
    let { rMin, rMax, cMin, cMax } = state.bounds;
    // Include pending positions
    for (const p of state.pending) {
      if (p.r < rMin) rMin = p.r;
      if (p.r > rMax) rMax = p.r;
      if (p.c < cMin) cMin = p.c;
      if (p.c > cMax) cMax = p.c;
    }
    // If board empty, focus on origin
    const hasAny = Object.keys(state.board).length > 0 || state.pending.length > 0;
    if (!hasAny) {
      return { rMin: -1, rMax: 1, cMin: -1, cMax: 1 };
    }
    return {
      rMin: rMin - pad,
      rMax: rMax + pad,
      cMin: cMin - pad,
      cMax: cMax + pad,
    };
  }, [state.bounds, state.board, state.pending]);

  const rows = displayBounds.rMax - displayBounds.rMin + 1;
  const cols = displayBounds.cMax - displayBounds.cMin + 1;

  function handleCellClick(r: number, c: number) {
    const pendingHere = state.pending.find((p) => p.r === r && p.c === c);
    if (pendingHere) {
      dispatch({ type: "recallTile", r, c } as QwirkleAction);
      return;
    }
    if (state.board[keyOf(r, c)]) return;
    if (!isHumanTurn) return;
    if (state.selectedHandIdx === null) return;
    dispatch({ type: "placeTile", r, c } as QwirkleAction);
  }

  return (
    <div className="qf-wrap fade-in" data-testid="quirkle-full-root">
      <div className="qf-scoreboard">
        {state.players.map((p, i) => (
          <div
            key={p.id}
            className={`qf-score-block ${
              state.currentPlayer === i && state.phase === "playing" ? "qf-active" : ""
            }`}
          >
            <div className="qf-score-label">{p.name}</div>
            <div
              className={`qf-score-val ${i === 0 ? "pulse" : ""}`}
              data-testid={`quirkle-full-score-${i}`}
            >
              {p.score}
            </div>
            <div className="qf-hand-count">{p.hand.length} tile{p.hand.length === 1 ? "" : "s"}</div>
          </div>
        ))}
      </div>

      <div className="qf-status">
        <div className="qf-bag">Bag: {state.bag.length}</div>
        <div className="qf-turn">
          {terminal
            ? "Game over"
            : state.players[state.currentPlayer]!.isCpu
            ? `${state.players[state.currentPlayer]!.name} thinking...`
            : "Your turn"}
        </div>
      </div>

      {state.lastMessage && (
        <div className="qf-message" data-testid="quirkle-full-message">
          {state.lastMessage}
        </div>
      )}

      <div
        className="qf-board"
        data-testid="quirkle-full-board"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, var(--qf-cell-size)))`,
          gridTemplateRows: `repeat(${rows}, var(--qf-cell-size))`,
        }}
      >
        {Array.from({ length: rows }).map((_, ri) => {
          const r = displayBounds.rMin + ri;
          return Array.from({ length: cols }).map((__, ci) => {
            const c = displayBounds.cMin + ci;
            const k = keyOf(r, c);
            const placed = state.board[k];
            const pending = state.pending.find((p) => p.r === r && p.c === c);
            const tile = placed?.tile ?? pending?.tile ?? null;
            let cls = "qf-cell";
            if (tile) cls += " qf-has-tile";
            if (pending) cls += " qf-pending";
            if (placed) cls += " qf-locked";
            const title = tile
              ? `${tile.color} ${tile.shape}`
              : `Row ${r}, Col ${c}`;
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                className={cls}
                onClick={() => handleCellClick(r, c)}
                disabled={state.phase === "done" || (!isHumanTurn && !pending)}
                title={title}
                aria-label={title}
                data-testid={`quirkle-full-cell-${r}-${c}`}
              >
                {tile && <TileGlyph tile={tile} size={26} />}
              </button>
            );
          });
        })}
      </div>

      <div className="qf-hand" data-testid="quirkle-full-hand">
        {human.hand.map((tile, i) => {
          const used = state.pending.some((p) => p.handIdx === i);
          const selected = state.selectedHandIdx === i;
          return (
            <button
              key={tile.id}
              type="button"
              className={`qf-tile ${used ? "qf-used" : ""} ${selected ? "qf-selected" : ""}`}
              onClick={() =>
                dispatch({ type: "selectHand", idx: i } as QwirkleAction)
              }
              disabled={used || !isHumanTurn || state.phase === "done"}
              title={`${tile.color} ${tile.shape}`}
              aria-label={`${tile.color} ${tile.shape} tile`}
              data-testid={`quirkle-full-hand-${i}`}
            >
              <TileGlyph tile={tile} size={28} />
            </button>
          );
        })}
      </div>

      <div className="qf-actions">
        <button
          type="button"
          className="qf-btn qf-submit"
          disabled={
            state.pending.length === 0 || !isHumanTurn || state.phase === "done"
          }
          onClick={() => dispatch({ type: "submit" } as QwirkleAction)}
          title="Submit the tiles you have placed on the board"
          data-testid="quirkle-full-submit"
        >
          Submit
        </button>
        <button
          type="button"
          className="qf-btn qf-recall"
          disabled={
            state.pending.length === 0 || !isHumanTurn || state.phase === "done"
          }
          onClick={() => dispatch({ type: "recallAll" } as QwirkleAction)}
          title="Return all your placed tiles back to your hand"
          data-testid="quirkle-full-recall"
        >
          Recall
        </button>
        <button
          type="button"
          className="qf-btn qf-swap"
          disabled={
            !isHumanTurn ||
            state.phase === "done" ||
            state.bag.length < 1 ||
            state.pending.length > 0
          }
          onClick={() => {
            const idxs = human.hand.map((_, i) => i);
            if (idxs.length === 0) return;
            dispatch({ type: "swap", idxs } as QwirkleAction);
          }}
          title="Swap your entire hand for new tiles (uses your turn)"
          data-testid="quirkle-full-swap"
        >
          Swap Hand
        </button>
      </div>

      {terminal && (
        <div className="qf-done bounce-in" data-testid="quirkle-full-done">
          <h2>
            {(() => {
              const max = Math.max(...state.players.map((p) => p.score));
              const winners = state.players.filter((p) => p.score === max);
              if (winners.length > 1) return "Tie game";
              if (winners[0]!.id === "human") return "You win!";
              return `${winners[0]!.name} wins`;
            })()}
          </h2>
          <ul className="qf-final-list">
            {state.players.map((p) => (
              <li key={p.id}>
                {p.name}: {p.score}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
