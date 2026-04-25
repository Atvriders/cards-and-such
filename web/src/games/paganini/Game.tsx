import { useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PaganiniState, PaganiniAction } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

const noSettings = {} as const;
type NoSettings = typeof noSettings;

const SUIT_LABELS = ["♠", "♥", "♦", "♣"];

export function PaganiniGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<PaganiniState, NoSettings>): JSX.Element {
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
    dispatch({ type: "move", fromCol: selected.col, toCol: colIdx, count: selected.count } as PaganiniAction);
    setSelected(null);
  };

  return (
    <div className="paganini">
      <div className="pag-info">
        <span>Moves: {state.movesMade}</span>
        {selected && <span>Sel: col {selected.col + 1}</span>}
      </div>

      <div className="pag-section">Foundations (8 piles, 2 per suit, A→K)</div>
      <div className="pag-row">
        {state.foundations.map((f, i) => {
          const top = f.length > 0 ? f[f.length - 1]! : null;
          const suit = SUIT_LABELS[i % 4]!;
          return (
            <div key={i} className="pag-pile-group">
              <div className="pag-label">{suit} #{Math.floor(i / 4) + 1} ({f.length})</div>
              {top ? <Card card={top} /> : <div className="pag-placeholder">A{suit}</div>}
              {wasteTop && (
                <button className="pag-btn" onClick={() => dispatch({ type: "waste-to-foundation", foundIdx: i } as PaganiniAction)}>
                  W→
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="pag-section">Tableau (alt-color down; click to select/move)</div>
      <div className="pag-row">
        {state.tableau.map((col, colIdx) => (
          <div key={colIdx} className="pag-col">
            <div className="pag-label">C{colIdx + 1}</div>
            {col.length === 0 ? (
              <div className="pag-placeholder" onClick={() => handleTableauClick(colIdx, 0)}>Empty</div>
            ) : (
              col.map((card, ci) => (
                <div
                  key={card.id}
                  className={selected?.col === colIdx && ci >= col.length - selected.count ? "pag-selected" : ""}
                  onClick={() => handleTableauClick(colIdx, ci)}
                  style={{ cursor: "pointer" }}
                >
                  <Card card={card} />
                </div>
              ))
            )}
            {col.length > 0 && [0, 1, 2, 3, 4, 5, 6, 7].map(fi => (
              <button
                key={fi}
                className="pag-btn"
                onClick={() => dispatch({ type: "tableau-to-foundation", fromCol: colIdx, foundIdx: fi } as PaganiniAction)}
              >
                →F{fi + 1}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="pag-section">Stock &amp; Waste</div>
      <div className="pag-row">
        <div className="pag-pile-group">
          <div className="pag-label">Stock</div>
          {state.stock.length > 0 ? (
            <Card faceDown onClick={() => dispatch({ type: "draw" } as PaganiniAction)} />
          ) : (
            <div
              className="pag-placeholder"
              style={{ cursor: state.waste.length > 0 ? "pointer" : "default" }}
              onClick={() => state.waste.length > 0 && dispatch({ type: "draw" } as PaganiniAction)}
            >
              {state.waste.length > 0 ? "Flip" : "Empty"}
            </div>
          )}
        </div>
        {wasteTop && (
          <div className="pag-pile-group">
            <div className="pag-label">Waste</div>
            <Card card={wasteTop} />
            {state.tableau.map((col, ci) => (
              <button
                key={ci}
                className="pag-btn"
                onClick={() => dispatch({ type: "waste-to-tableau", toCol: ci } as PaganiniAction)}
              >
                →C{ci + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
