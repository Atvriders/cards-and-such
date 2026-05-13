import { useEffect, useMemo, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  RummikubFullAction,
  RummikubFullSettings,
  RummikubFullState,
  Tile,
} from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

function TileView({
  tile,
  selected,
  pendingNew,
  onClick,
  testId,
}: {
  tile: Tile;
  selected?: boolean;
  pendingNew?: boolean;
  onClick?: () => void;
  testId?: string;
}) {
  const isJoker = tile.color === "joker";
  const cls = [
    "rkf-tile",
    `rkf-tile--${tile.color}`,
    selected ? "rkf-tile--selected" : "",
    pendingNew ? "rkf-tile--pending" : "",
    onClick ? "rkf-tile--clickable" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      type="button"
      className={cls}
      onClick={onClick}
      disabled={!onClick}
      title={isJoker ? "Joker (wild)" : `${tile.num} ${tile.color}`}
      aria-label={isJoker ? "Joker tile" : `${tile.num} ${tile.color} tile`}
      data-testid={testId}
    >
      <span className="rkf-tile__num">{isJoker ? "★" : tile.num}</span>
    </button>
  );
}

export function RummikubFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<RummikubFullState, RummikubFullSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);

  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Sort hand by color then number for ergonomics.
  const sortedHand = useMemo(() => {
    const order: Record<string, number> = { red: 0, blue: 1, orange: 2, black: 3, joker: 4 };
    return [...state.hands[0]!].sort((a, b) => {
      const oa = order[a.color] ?? 99;
      const ob = order[b.color] ?? 99;
      if (oa !== ob) return oa - ob;
      return a.num - b.num;
    });
  }, [state.hands]);

  const committedIds = useMemo(() => new Set(state.handCommitted.map((t) => t.id)), [state.handCommitted]);
  const isMyTurn = state.turn === 0 && state.phase === "play";
  const opened = state.opened[0]!;

  const handleHandClick = (id: number) => {
    if (!isMyTurn) return;
    dispatch({ type: "toggle-hand", id } satisfies RummikubFullAction);
  };
  const handleTableClick = (id: number) => {
    if (!isMyTurn || !opened) return;
    dispatch({ type: "toggle-table", id } satisfies RummikubFullAction);
  };

  return (
    <div className="rkf fade-in">
      <div className="rkf-info game-info">
        <span>
          <span className="label">Pool</span>{" "}
          <span className="value">{state.pool.length}</span>
        </span>
        <span>
          <span className="label">You</span>{" "}
          <span className="value">{state.hands[0]!.length}</span>
        </span>
        {[1, 2, 3].map((seat) => (
          <span key={seat}>
            <span className="label">CPU {seat}</span>{" "}
            <span className="value">{state.hands[seat]!.length}</span>
          </span>
        ))}
        <span>
          <span className="label">Turn</span>{" "}
          <span className="value">{state.turn === 0 ? "You" : `CPU ${state.turn}`}</span>
        </span>
      </div>

      <div
        className={`rkf-status ${terminal ? (state.winner === 0 ? "win pulse" : "loss") : ""}`}
        data-testid="rkf-status"
      >
        {state.message}
      </div>

      <div className="rkf-table-label">
        Table — {state.table.length} {state.table.length === 1 ? "meld" : "melds"}
      </div>
      <div className="rkf-table">
        {state.table.length === 0 && (
          <span className="rkf-empty">No melds played yet.</span>
        )}
        {state.table.map((meld, mi) => (
          <div key={mi} className="rkf-meld">
            {meld.map((tile) => {
              const clickable = isMyTurn && opened;
              const props = clickable
                ? { onClick: () => handleTableClick(tile.id) }
                : {};
              return (
                <TileView
                  key={tile.id}
                  tile={tile}
                  selected={state.selectedTableIds.includes(tile.id)}
                  testId={`rkf-table-tile-${tile.id}`}
                  {...props}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="rkf-hand-label">
        Your hand — {state.hands[0]!.length}
        {state.selectedHandIds.length > 0 && (
          <> &middot; {state.selectedHandIds.length} selected</>
        )}
      </div>
      <div className="rkf-hand">
        {sortedHand.map((tile) => {
          const props = isMyTurn
            ? { onClick: () => handleHandClick(tile.id) }
            : {};
          return (
            <TileView
              key={tile.id}
              tile={tile}
              selected={state.selectedHandIds.includes(tile.id)}
              pendingNew={!committedIds.has(tile.id) && isMyTurn}
              testId={`rkf-hand-tile-${tile.id}`}
              {...props}
            />
          );
        })}
      </div>

      {!terminal && isMyTurn && (
        <div className="rkf-actions">
          <button
            type="button"
            className="game-button game-button--primary"
            onClick={() => dispatch({ type: "place-new-meld" })}
            title="Place selected hand tiles on the table as a new meld"
            disabled={state.selectedHandIds.length < 3}
            data-testid="rkf-place"
          >
            Place new meld ({state.selectedHandIds.length})
          </button>
          <button
            type="button"
            className="game-button"
            onClick={() => dispatch({ type: "merge-selection" })}
            title="Combine selected table tiles with selected hand tiles into one meld"
            disabled={state.selectedHandIds.length + state.selectedTableIds.length < 3}
            data-testid="rkf-merge"
          >
            Merge selection
          </button>
          <button
            type="button"
            className="game-button game-button--success"
            onClick={() => dispatch({ type: "commit" })}
            title="End your turn and lock in this turn's plays"
            data-testid="rkf-commit"
          >
            Commit turn
          </button>
          <button
            type="button"
            className="game-button game-button--secondary"
            onClick={() => dispatch({ type: "reset-turn" })}
            title="Discard pending plays and rebuild this turn from scratch"
            data-testid="rkf-reset"
          >
            Reset turn
          </button>
          <button
            type="button"
            className="game-button game-button--danger"
            onClick={() => dispatch({ type: "draw" })}
            title="Draw one tile from the pouch and end your turn"
            disabled={state.pool.length === 0}
            data-testid="rkf-draw"
          >
            Draw tile
          </button>
        </div>
      )}

      {terminal && (
        <div className="rkf-end bounce-in">
          <div className="rkf-end__title">
            {state.winner === 0
              ? `You win! +${terminal.score} pts`
              : state.winner === -1
                ? "Stalemate — pouch empty."
                : `CPU ${state.winner} wins this hand.`}
          </div>
          <button
            type="button"
            className="game-button game-button--primary"
            onClick={() => dispatch({ type: "restart" })}
            title="Deal a fresh hand and start over"
            data-testid="rkf-restart"
          >
            Play again
          </button>
        </div>
      )}

      {!isMyTurn && !terminal && (
        <div className="rkf-cpu-note">CPU {state.turn} is thinking…</div>
      )}
    </div>
  );
}
