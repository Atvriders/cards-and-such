import { useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AustralianPatienceState, AustralianPatienceAction } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Game.css";

const noSettings = {} as const;
type NoSettings = typeof noSettings;

export function AustralianPatienceGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<AustralianPatienceState, NoSettings>): JSX.Element {
  const [selected, setSelected] = useState<{ col: number; cardIdx: number } | null>(null);

  if (state.won) onGameOver(Math.max(0, 500 - state.movesMade));

  const handleColClick = (colIdx: number, cardIdx: number) => {
    if (selected) {
      if (selected.col === colIdx) {
        setSelected(null);
        return;
      }
      dispatch({ type: "move", fromCol: selected.col, toCol: colIdx, cardIdx: selected.cardIdx } as AustralianPatienceAction);
      setSelected(null);
    } else {
      const col = state.tableau[colIdx];
      if (col && col.length > 0) setSelected({ col: colIdx, cardIdx });
    }
  };

  const handleFoundation = (colIdx: number) => {
    setSelected(null);
    dispatch({ type: "move-to-foundation", fromCol: colIdx } as AustralianPatienceAction);
  };

  return (
    <div className="australian-patience">
      <div className="aus-info">
        <span>Moves: {state.movesMade}</span>
        <span>Stock: {state.stock.length}</span>
        {selected && <span>Selected col {selected.col + 1}</span>}
      </div>

      <div className="aus-label">Foundations</div>
      <div className="aus-foundations">
        {state.foundations.map((f, i) => {
          const top = f.length > 0 ? f[f.length - 1]! : null;
          return (
            <div key={i}>
              {top ? <Card card={top} /> : <div className="aus-pile-placeholder">A</div>}
              <div className="aus-label">{f.length}/13</div>
            </div>
          );
        })}
        <div>
          {state.stock.length > 0 ? (
            <Card faceDown onClick={() => dispatch({ type: "draw" } as AustralianPatienceAction)} />
          ) : (
            <div className="aus-pile-placeholder">Stock empty</div>
          )}
          <div className="aus-label">Stock</div>
        </div>
      </div>

      <div className="aus-label">Tableau (click card to select, click column to move)</div>
      <div className="aus-tableau">
        {state.tableau.map((col, colIdx) => (
          <div key={colIdx} className="aus-col">
            <div className="aus-label">Col {colIdx + 1}</div>
            {col.length === 0 ? (
              <div className="aus-pile-placeholder" onClick={() => handleColClick(colIdx, 0)}>Empty</div>
            ) : (
              col.map((card, ci) => (
                <div
                  key={card.id}
                  className="aus-card-wrap"
                  onClick={() => handleColClick(colIdx, ci)}
                  style={{ opacity: selected?.col === colIdx && ci >= selected.cardIdx ? 0.7 : 1 }}
                >
                  <Card card={card} />
                </div>
              ))
            )}
            <button
              className="aus-btn"
              disabled={col.length === 0}
              onClick={() => handleFoundation(colIdx)}
            >
              → Found
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
