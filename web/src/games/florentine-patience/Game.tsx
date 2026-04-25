import { useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FlorentineState, FlorentineAction } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

const noSettings = {} as const;
type NoSettings = typeof noSettings;

type Selection = { kind: "tableau"; col: number } | { kind: "reserve"; idx: number };

export function FlorentineGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<FlorentineState, NoSettings>): JSX.Element {
  const [selected, setSelected] = useState<Selection | null>(null);

  if (state.won) onGameOver(Math.max(0, 500 - state.movesMade));

  const handleTableauClick = (colIdx: number) => {
    if (!selected) {
      if (state.tableau[colIdx]!.length > 0) setSelected({ kind: "tableau", col: colIdx });
      return;
    }
    if (selected.kind === "tableau" && selected.col === colIdx) { setSelected(null); return; }
    if (selected.kind === "tableau") {
      dispatch({ type: "move-tableau", fromCol: selected.col, toCol: colIdx } as FlorentineAction);
    } else {
      dispatch({ type: "move-reserve", reserveIdx: selected.idx, toCol: colIdx } as FlorentineAction);
    }
    setSelected(null);
  };

  const handleReserveClick = (idx: number) => {
    if (!state.reserve[idx]) return;
    if (selected?.kind === "reserve" && selected.idx === idx) { setSelected(null); return; }
    setSelected({ kind: "reserve", idx });
  };

  return (
    <div className="florentine">
      <div className="flo-info">
        <span>Moves: {state.movesMade}</span>
        <span>Stock: {state.stock.length}</span>
      </div>

      <div className="flo-section">Foundations</div>
      <div className="flo-row">
        {state.foundations.map((f, i) => {
          const top = f.length > 0 ? f[f.length - 1]! : null;
          return (
            <div key={i} className="flo-pile-group">
              {top ? <Card card={top} /> : <div className="flo-placeholder">A</div>}
              <div className="flo-label">{f.length}/13</div>
            </div>
          );
        })}
      </div>

      <div className="flo-section">Reserve (4 slots)</div>
      <div className="flo-row">
        {state.reserve.map((card, i) => (
          <div key={i} className="flo-pile-group">
            {card ? (
              <div className={selected?.kind === "reserve" && selected.idx === i ? "flo-selected" : ""}>
                <Card card={card} onClick={() => handleReserveClick(i)} />
              </div>
            ) : (
              <div className="flo-placeholder">Empty</div>
            )}
            {card && (
              <button
                className="flo-btn"
                onClick={() => dispatch({ type: "reserve-to-foundation", reserveIdx: i } as FlorentineAction)}
              >
                → Found
              </button>
            )}
          </div>
        ))}
        <div className="flo-pile-group">
          <div className="flo-label">Stock</div>
          {state.stock.length > 0 ? (
            <Card faceDown onClick={() => dispatch({ type: "draw" } as FlorentineAction)} />
          ) : (
            <div className="flo-placeholder">Empty</div>
          )}
        </div>
      </div>

      <div className="flo-section">Tableau (build down same-suit; click top to move)</div>
      <div className="flo-row">
        {state.tableau.map((col, colIdx) => (
          <div key={colIdx} className="flo-col">
            <div className="flo-label">Col {colIdx + 1}</div>
            {col.length === 0 ? (
              <div className="flo-placeholder" onClick={() => handleTableauClick(colIdx)}>Empty</div>
            ) : (
              col.map((card, ci) => (
                <div
                  key={card.id}
                  className={
                    ci === col.length - 1 &&
                    selected?.kind === "tableau" &&
                    selected.col === colIdx
                      ? "flo-selected"
                      : ""
                  }
                  onClick={ci === col.length - 1 ? () => handleTableauClick(colIdx) : undefined}
                  style={{ cursor: ci === col.length - 1 ? "pointer" : "default" }}
                >
                  <Card card={card} />
                </div>
              ))
            )}
            <button
              className="flo-btn"
              disabled={col.length === 0}
              onClick={() => { setSelected(null); dispatch({ type: "tableau-to-foundation", fromCol: colIdx } as FlorentineAction); }}
            >
              → Found
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
