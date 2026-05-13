import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PyramidState, PyramidAction, PyramidSettings, Cell } from "./state.js";
import { isAvailablePyramid } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { isTerminal } from "./state.js";
import "./Pyramid.css";

const ROW_SIZES = [1, 2, 3, 4, 5, 6, 7];

export function Pyramid({
  state,
  dispatch,
  onGameOver,
}: GameProps<PyramidState, PyramidSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "d" || e.key === "D" || e.key === " ") {
        e.preventDefault();
        if (state.stock.length > 0) dispatch({ type: "draw" } as PyramidAction);
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        dispatch({ type: "redeal" } as PyramidAction);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, state.stock.length]);

  function isSelected(row: number, col: number): boolean {
    return (
      state.selected !== null &&
      state.selected.kind === "pyramid" &&
      state.selected.row === row &&
      state.selected.col === col
    );
  }

  function handlePyramidClick(row: number, col: number): void {
    dispatch({ type: "select", source: { kind: "pyramid", row, col } } as PyramidAction);
  }

  function handleWasteClick(): void {
    dispatch({ type: "select", source: { kind: "waste" } } as PyramidAction);
  }

  function handleStockClick(): void {
    dispatch({ type: "draw" } as PyramidAction);
  }

  function handleRedeal(): void {
    dispatch({ type: "redeal" } as PyramidAction);
  }

  const topWaste = state.waste.length > 0 ? state.waste[state.waste.length - 1] : undefined;
  const wasteSelected = state.selected?.kind === "waste";

  return (
    <div className={`pyramid-game fade-in${state.won ? " has-won" : ""}`}>
      <div className="pyramid-info">
        <span>Moves: {state.movesMade}</span>
        <span>Redeals left: {state.redealsRemaining}</span>
        {state.won && <span className="pyramid-status">You win!</span>}
        {state.lost && <span className="pyramid-status lost">No more moves</span>}
      </div>

      <div className="pyramid-grid">
        {ROW_SIZES.map((size, row) => (
          <div key={row} className="pyramid-row">
            {Array.from({ length: size }, (_, col) => {
              const cell: Cell = state.pyramid[row]?.[col] ?? null;
              if (!cell) return <div key={col} className="pyramid-cell" />;
              if (cell.removed) {
                return (
                  <div key={col} className="pyramid-cell">
                    <div className="card removed" aria-hidden="true" />
                  </div>
                );
              }
              const available = isAvailablePyramid(state.pyramid, row, col);
              const selected = isSelected(row, col);
              const className = [
                available ? "available" : "unavailable",
                selected ? "selected" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div key={col} className="pyramid-cell" data-testid={`hint-target-pyramid-${row}-${col}`}>
                  <Card
                    card={cell.card}
                    className={className}
                    {...(available ? { onClick: () => handlePyramidClick(row, col) } : {})}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="pyramid-bottom">
        <div className="pyramid-stock-area" data-testid="hint-target-pyramid-stock">
          <span className="pyramid-area-label">Stock ({state.stock.length})</span>
          {state.stock.length > 0 ? (
            <Card faceDown onClick={handleStockClick} />
          ) : (
            <div
              className="pyramid-empty-card"
              role="button"
              tabIndex={0}
              aria-label="Redeal stock"
              onClick={handleRedeal}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleRedeal(); } }}
              style={{ cursor: state.redealsRemaining > 0 && state.waste.length > 0 ? "pointer" : "default" }}
            >
              empty
            </div>
          )}
        </div>

        <div className="pyramid-waste-area">
          <span className="pyramid-area-label">Waste</span>
          {topWaste ? (
            <Card
              card={topWaste}
              className={wasteSelected ? "selected available" : "available"}
              onClick={handleWasteClick}
            />
          ) : (
            <div className="pyramid-empty-card">empty</div>
          )}
        </div>

        {state.stock.length === 0 && (
          <button
            className="pyramid-redeal-btn"
            onClick={handleRedeal}
            disabled={state.redealsRemaining <= 0 || state.waste.length === 0}
          >
            Redeal ({state.redealsRemaining})
          </button>
        )}
      </div>
    </div>
  );
}
