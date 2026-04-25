import { useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KingsRowState, KingsRowAction } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

const noSettings = {} as const;
type NoSettings = typeof noSettings;

export function KingsRowGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<KingsRowState, NoSettings>): JSX.Element {
  const [selected, setSelected] = useState<{ col: number; count: number } | null>(null);

  if (state.won) onGameOver(Math.max(0, 500 - state.movesMade));

  const wasteTop = state.waste.length > 0 ? state.waste[state.waste.length - 1]! : null;

  const handleTableauClick = (colIdx: number, cardIdx: number) => {
    const col = state.tableau[colIdx]!;
    const count = col.length - cardIdx;
    if (!selected) {
      if (col.length > 0) setSelected({ col: colIdx, count });
      return;
    }
    if (selected.col === colIdx) { setSelected(null); return; }
    dispatch({ type: "move", fromCol: selected.col, toCol: colIdx, count: selected.count } as KingsRowAction);
    setSelected(null);
  };

  return (
    <div className="kings-row">
      <div className="kr-info">
        <span>Moves: {state.movesMade}</span>
        {selected && <span>Selected col {selected.col + 1} ({selected.count} cards)</span>}
      </div>

      <div className="kr-section">Foundations (build King down to Ace, same color)</div>
      <div className="kr-row">
        {state.foundations.map((f, i) => {
          const top = f.length > 0 ? f[f.length - 1]! : null;
          const label = i < 2 ? "Black" : "Red";
          return (
            <div key={i} className="kr-pile-group">
              <div className="kr-label">{label} F{i + 1} ({f.length}/13)</div>
              {top ? <Card card={top} /> : <div className="kr-placeholder">K</div>}
              {wasteTop && (
                <button
                  className="kr-btn"
                  onClick={() => dispatch({ type: "waste-to-foundation", foundIdx: i } as KingsRowAction)}
                >
                  Waste→
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="kr-section">Tableau (alt-color down; click to select/place)</div>
      <div className="kr-row">
        {state.tableau.map((col, colIdx) => (
          <div key={colIdx} className="kr-col">
            <div className="kr-label">C{colIdx + 1}</div>
            {col.length === 0 ? (
              <div className="kr-placeholder" onClick={() => handleTableauClick(colIdx, 0)}>Empty</div>
            ) : (
              col.map((card, ci) => (
                <div
                  key={card.id}
                  className={selected?.col === colIdx && ci >= col.length - selected.count ? "kr-selected" : ""}
                  onClick={() => handleTableauClick(colIdx, ci)}
                  style={{ cursor: "pointer" }}
                >
                  <Card card={card} />
                </div>
              ))
            )}
            {col.length > 0 && (
              <>
                <button className="kr-btn" onClick={() => dispatch({ type: "tableau-to-foundation", fromCol: colIdx, foundIdx: 0 } as KingsRowAction)}>→F1</button>
                <button className="kr-btn" onClick={() => dispatch({ type: "tableau-to-foundation", fromCol: colIdx, foundIdx: 1 } as KingsRowAction)}>→F2</button>
                <button className="kr-btn" onClick={() => dispatch({ type: "tableau-to-foundation", fromCol: colIdx, foundIdx: 2 } as KingsRowAction)}>→F3</button>
                <button className="kr-btn" onClick={() => dispatch({ type: "tableau-to-foundation", fromCol: colIdx, foundIdx: 3 } as KingsRowAction)}>→F4</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
