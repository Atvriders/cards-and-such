import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DozenState, DozenAction, DozenSettings } from "./state.js";
import { Card as CardComponent } from "../../engines/deck/Card.js";
import "./Dozen.css";

export function Dozen({ state, dispatch, onGameOver }: GameProps<DozenState, DozenSettings>): JSX.Element {
  if (state.won || state.lost) {
    const total = state.foundations.reduce((s, f) => s + f.length, 0);
    onGameOver(total * 10 + state.removedPairs * 5);
  }

  const send = (action: DozenAction) => dispatch(action);

  return (
    <div className="dozen">
      <div className="dozen-info">
        <span>Pairs removed: {state.removedPairs}</span>
        <span>Moves: {state.movesMade}</span>
        {state.won && <span>You win!</span>}
        {state.lost && !state.won && <span>No moves left</span>}
      </div>

      <div className="dozen-section">Foundations (A→Q, same suit, no Kings)</div>
      <div className="dozen-row">
        {state.foundations.map((f, fIdx) => {
          const top = f.length > 0 ? f[f.length - 1]! : null;
          return (
            <div key={fIdx} className="dozen-foundation">
              {top ? (
                <CardComponent card={top} />
              ) : (
                <div className="dozen-placeholder">A</div>
              )}
              <div className="dozen-f-label">{f.length}/12</div>
            </div>
          );
        })}
      </div>

      <div className="dozen-section">Columns — click top cards to pair them or click foundation to send</div>
      <div className="dozen-columns">
        {state.columns.map((col, cIdx) => {
          const isSelected = state.selected === cIdx;
          return (
            <div
              key={cIdx}
              className={`dozen-col${isSelected ? " selected-col" : ""}`}
              onClick={() => send({ type: "select-column", colIdx: cIdx })}
            >
              {col.length === 0 ? (
                <div className="dozen-placeholder">Empty</div>
              ) : (
                col.map((card, i) => (
                  <CardComponent key={card.id} card={card} className={i === col.length - 1 ? "clickable" : ""} />
                ))
              )}
              {col.length > 0 && (
                <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                  {state.foundations.map((f, fIdx) => {
                    const top = col[col.length - 1]!;
                    const fTop = f.length > 0 ? f[f.length - 1]! : null;
                    const canGo = (!fTop && top.rank === 1) || (fTop && fTop.suit === top.suit && top.rank === fTop.rank + 1);
                    return canGo ? (
                      <button
                        key={fIdx}
                        style={{ fontSize: 9, padding: "1px 3px", border: "1px solid #555", borderRadius: 3, background: "#1a3a1a", color: "#8f8", cursor: "pointer" }}
                        onClick={(e) => { e.stopPropagation(); send({ type: "move-to-foundation", colIdx: cIdx, foundationIdx: fIdx }); }}
                      >→F</button>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
