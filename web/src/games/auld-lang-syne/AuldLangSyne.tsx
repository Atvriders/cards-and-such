import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AuldLangSyneState, AuldLangSyneAction, AuldLangSyneSettings } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./AuldLangSyne.css";

export function AuldLangSyne({ state, dispatch, onGameOver }: GameProps<AuldLangSyneState, AuldLangSyneSettings>): JSX.Element {
  if (state.won) onGameOver(Math.max(0, 500 - state.movesMade));

  return (
    <div className="auld-lang-syne">
      <div className="auld-info">
        <span>Moves: {state.movesMade}</span>
        <span>Stock: {state.stock.length}</span>
        <span>Waste: {state.waste.length}</span>
      </div>

      <div className="auld-section-label">Foundations (build up same-suit from Ace)</div>
      <div className="auld-row">
        {state.foundations.map((foundation, fIdx) => {
          const top = foundation.length > 0 ? foundation[foundation.length - 1]! : null;
          return (
            <div key={fIdx} className="auld-pile-group">
              {top ? <Card card={top} /> : <div className="auld-pile-placeholder">A</div>}
              <div className="auld-section-label">{foundation.length}/13</div>
            </div>
          );
        })}
      </div>

      <div className="auld-section-label">Tableau (click to send to foundation or discard)</div>
      <div className="auld-row">
        {state.tableau.map((col, tIdx) => {
          const top = col.length > 0 ? col[col.length - 1]! : null;
          return (
            <div key={tIdx} className="auld-pile-group">
              {top ? (
                <Card card={top} />
              ) : (
                <div className="auld-pile-placeholder">Empty</div>
              )}
              <div className="auld-btns">
                <button
                  className="auld-btn"
                  disabled={!top}
                  onClick={() => dispatch({ type: "move-to-foundation", tableauIdx: tIdx } as AuldLangSyneAction)}
                >
                  → Found
                </button>
                <button
                  className="auld-btn"
                  disabled={!top}
                  onClick={() => dispatch({ type: "discard-to-waste", tableauIdx: tIdx } as AuldLangSyneAction)}
                >
                  Discard
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="auld-row">
        <div className="auld-pile-group">
          <div className="auld-section-label">Stock ({state.stock.length})</div>
          {state.stock.length > 0 ? (
            <Card faceDown onClick={() => dispatch({ type: "draw" } as AuldLangSyneAction)} />
          ) : (
            <div className="auld-pile-placeholder">Empty</div>
          )}
        </div>
        <div className="auld-pile-group">
          <div className="auld-section-label">Waste ({state.waste.length})</div>
          {state.waste.length > 0 ? (
            <Card card={state.waste[state.waste.length - 1]!} />
          ) : (
            <div className="auld-pile-placeholder">Empty</div>
          )}
        </div>
      </div>
    </div>
  );
}
