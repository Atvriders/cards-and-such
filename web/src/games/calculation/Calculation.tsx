import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CalculationState, CalculationAction, CalculationSettings } from "./state.js";
import { nextRankForFoundation, canPlayOnFoundation } from "./state.js";
import { rankLabel } from "../../engines/deck/index.js";
import type { Rank } from "../../engines/deck/index.js";
import { Card } from "../../engines/deck/Card.js";
import "./Calculation.css";

const INCREMENTS = [1, 2, 3, 4];
const INCREMENT_LABELS = ["+1", "+2", "+3", "+4"];

export function Calculation({ state, dispatch, onGameOver }: GameProps<CalculationState, CalculationSettings>): JSX.Element {
  if (state.won) onGameOver(Math.max(0, 1000 - state.movesMade * 5));

  const send = (action: CalculationAction) => dispatch(action);

  return (
    <div className="calculation">
      <div className="calc-info">
        <span>Moves: {state.movesMade}</span>
        <span>Stock: {state.stock.length}</span>
      </div>

      <div className="calc-section">Foundations (click stock card to send there)</div>
      <div className="calc-row">
        {state.foundations.map((f, fIdx) => {
          const top = f.length > 0 ? f[f.length - 1]! : null;
          const needed = nextRankForFoundation(f, fIdx);
          const canPlay = state.stockTop ? canPlayOnFoundation(state.stockTop, f, fIdx) : false;
          return (
            <div key={fIdx} className="calc-pile-group">
              {top ? <Card card={top} /> : <div className="calc-placeholder">{rankLabel(f[0]?.rank ?? (fIdx + 1) as any)}</div>}
              <div className="calc-label">{INCREMENT_LABELS[fIdx]} | next: {rankLabel(needed as any)}</div>
              {canPlay && (
                <button className="calc-btn" onClick={() => send({ type: "stock-to-foundation", foundationIdx: fIdx })}>
                  Play here
                </button>
              )}
              <div className="calc-label">{f.length}/13</div>
            </div>
          );
        })}
      </div>

      <div className="calc-section">Waste piles (temporary storage — play from top)</div>
      <div className="calc-waste-row">
        {state.wastePiles.map((w, wIdx) => {
          const top = w.length > 0 ? w[w.length - 1]! : null;
          return (
            <div key={wIdx} className="calc-pile-group">
              {top ? (
                <Card card={top} onClick={() => {
                  // Try to move to each foundation
                  for (let fi = 0; fi < 4; fi++) {
                    if (canPlayOnFoundation(top, state.foundations[fi]!, fi)) {
                      send({ type: "waste-to-foundation", wasteIdx: wIdx, foundationIdx: fi });
                      return;
                    }
                  }
                }} />
              ) : (
                <div className="calc-placeholder">W{wIdx + 1}</div>
              )}
              {state.stockTop && top && (
                <div className="calc-label">{w.length} cards</div>
              )}
              {!top && state.stockTop && (
                <button className="calc-btn" onClick={() => send({ type: "stock-to-waste", wasteIdx: wIdx })}>
                  Place here
                </button>
              )}
              {top && state.stockTop && (
                <button className="calc-btn" onClick={() => send({ type: "stock-to-waste", wasteIdx: wIdx })}>
                  + Stack
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="calc-row">
        <div className="calc-pile-group">
          <div className="calc-section">Stock card (draw next)</div>
          {state.stockTop ? (
            <Card card={state.stockTop} />
          ) : (
            <div className="calc-placeholder">Empty</div>
          )}
          {state.stock.length > 0 && (
            <button className="calc-btn" onClick={() => send({ type: "draw" })}>
              Draw next ({state.stock.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
