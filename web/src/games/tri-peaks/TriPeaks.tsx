import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TriPeaksState, TriPeaksAction, TriPeaksSettings } from "./state.js";
import { isUncovered, ranksAdjacent, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./TriPeaks.css";

// Row sizes: row 0=3, row 1=6, row 2=9, row 3=10
const ROW_SIZES = [3, 6, 9, 10];

export function TriPeaks({
  state,
  dispatch,
  onGameOver,
}: GameProps<TriPeaksState, TriPeaksSettings>): JSX.Element {
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
        if (state.stock.length > 0) dispatch({ type: "draw" } as TriPeaksAction);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, state.stock.length]);

  function handleCardClick(row: number, col: number): void {
    dispatch({ type: "play", row, col } as TriPeaksAction);
  }

  function handleStockClick(): void {
    dispatch({ type: "draw" } as TriPeaksAction);
  }

  function renderRow(row: number): JSX.Element {
    const size = ROW_SIZES[row]!;
    const cells = [];

    for (let col = 0; col < size; col++) {
      const cell = state.pyramid[row]?.[col];
      if (!cell) continue;

      if (cell.removed) {
        cells.push(
          <div key={col} className="card removed" aria-hidden="true" style={{ width: 52, height: 74 }} />,
        );
        continue;
      }

      const uncovered = isUncovered(state.pyramid, row, col);
      const playable =
        uncovered &&
        ranksAdjacent(cell.card.rank, state.currentCard.rank, state.settings.wrapAces);

      const className = playable ? "playable" : "unavailable";

      cells.push(
        <Card
          key={col}
          card={cell.card}
          className={className}
          {...(playable ? { onClick: () => handleCardClick(row, col) } : {})}
        />,
      );

      // Add gap between peaks in row 1 (after cols 1 and 3)
      if (row === 1 && (col === 1 || col === 3)) {
        cells.push(<div key={`gap-${col}`} className="peak-gap" />);
      }
    }

    return (
      <div key={row} className={`tri-peaks-row tri-peaks-row-${row}`}>
        {cells}
      </div>
    );
  }

  return (
    <div className={`tri-peaks-game${state.won ? " has-won" : ""}`}>
      <div className="tri-peaks-info">
        <span>Moves: {state.movesMade}</span>
        <span>Stock: {state.stock.length}</span>
        {state.won && <span className="tri-peaks-status">You win!</span>}
        {state.lost && <span className="tri-peaks-status lost">No more moves</span>}
      </div>

      <div className="tri-peaks-grid">
        {[0, 1, 2, 3].map((row) => renderRow(row))}
      </div>

      <div className="tri-peaks-bottom">
        <div className="tri-peaks-stock-area">
          <span className="tri-peaks-area-label">Stock ({state.stock.length})</span>
          {state.stock.length > 0 ? (
            <Card faceDown onClick={handleStockClick} />
          ) : (
            <div className="tri-peaks-empty-card">empty</div>
          )}
        </div>

        <div className="tri-peaks-current-area">
          <span className="tri-peaks-area-label">Current</span>
          <div className="tri-peaks-current-card">
            <Card card={state.currentCard} />
          </div>
        </div>
      </div>
    </div>
  );
}
