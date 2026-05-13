import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DecadeSolitaireState, DecadeSolitaireAction, DecadeSolitaireSettings } from "./state.js";
import { isTerminal, cardName, cardValue, encode } from "./state.js";
import "./Game.css";

export function DecadeSolitaire({ state, dispatch, onGameOver }: GameProps<DecadeSolitaireState, DecadeSolitaireSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isRed = (c: number) => { const s = Math.floor(c / 13); return s === 1 || s === 2; };

  const selSum = state.selected.reduce((s, enc) => {
    const col = Math.floor(enc / 100);
    const row = enc % 100;
    const card = state.columns[col]![row];
    return s + (card !== undefined ? cardValue(card) : 0);
  }, 0);

  if (state.phase === "won" || state.phase === "stuck") {
    return (
      <div className="decade-wrap">
        <h2>{state.phase === "won" ? "You Win! 100 pts" : `Stuck! Score: ${Math.max(0, 100 - state.columns.reduce((s, col) => s + col.length, 0) * 2)}`}</h2>
        <p>Moves: {state.moves}</p>
      </div>
    );
  }

  return (
    <div className="decade-wrap fade-in">
      <div className="decade-header">
        <span>Decade Solitaire</span>
        <span>Moves: {state.moves}</span>
        {state.selected.length > 0 && <span style={{ color: (selSum === 10 || selSum === 20) ? "#27ae60" : "#e74c3c" }}>Sum: {selSum}</span>}
      </div>
      <div className="decade-cols">
        {state.columns.map((col, ci) => (
          <div key={ci} className="decade-col">
            {col.map((card, ri) => {
              const enc = encode(ci, ri);
              const isTop = ri === col.length - 1;
              const isSel = state.selected.includes(enc);
              return (
                <div key={ri} className={`decade-card${isSel ? " selected" : ""}${isTop ? " top" : ""}`}
                  style={{ color: isRed(card) ? "#e74c3c" : "#222", cursor: isTop ? "pointer" : "default", marginTop: ri === 0 ? "0" : "-30px" }}
                  onClick={() => isTop && dispatch({ type: "select", col: ci, row: ri } as DecadeSolitaireAction)}>
                  {cardName(card)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="decade-actions">
        {(selSum === 10 || selSum === 20) && (
          <button className="decade-btn" onClick={() => dispatch({ type: "remove" } as DecadeSolitaireAction)}>Remove ({selSum})</button>
        )}
        {state.selected.length > 0 && (
          <button className="decade-btn clear" onClick={() => dispatch({ type: "clearSel" } as DecadeSolitaireAction)}>Clear</button>
        )}
      </div>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>Select top cards that sum to 10 or 20, then Remove.</p>
    </div>
  );
}
