import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PrecedenceState, PrecedenceAction } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

const noSettings = {} as const;
type NoSettings = typeof noSettings;

export function PrecedenceGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<PrecedenceState, NoSettings>): JSX.Element {
  if (state.won) onGameOver(Math.max(0, 500 - state.movesMade));

  const wasteTop = state.waste.length > 0 ? state.waste[state.waste.length - 1]! : null;
  const emptyReserveIdx = state.reserve.findIndex(c => c === null);

  return (
    <div className="precedence">
      <div className="prec-info">
        <span>Moves: {state.movesMade}</span>
        <span>Stock: {state.stock.length}</span>
        <span>Waste: {state.waste.length}</span>
        <span>Reserve: {state.reserve.filter(Boolean).length}/8</span>
      </div>

      <div className="prec-section">Foundations (K down to A, same suit)</div>
      <div className="prec-row">
        {state.foundations.map((f, i) => {
          const top = f.length > 0 ? f[f.length - 1]! : null;
          return (
            <div key={i} className="prec-pile-group">
              {top ? <Card card={top} /> : <div className="prec-placeholder">K</div>}
              <div className="prec-label">{f.length}/13</div>
            </div>
          );
        })}
      </div>

      <div className="prec-section">Stock &amp; Waste</div>
      <div className="prec-row">
        <div className="prec-pile-group">
          <div className="prec-label">Stock ({state.stock.length})</div>
          {state.stock.length > 0 ? (
            <Card faceDown onClick={() => dispatch({ type: "draw" } as PrecedenceAction)} />
          ) : (
            <div
              className="prec-placeholder"
              style={{ cursor: state.waste.length > 0 ? "pointer" : "default" }}
              onClick={() => state.waste.length > 0 && dispatch({ type: "draw" } as PrecedenceAction)}
            >
              {state.waste.length > 0 ? "Redeal" : "Empty"}
            </div>
          )}
        </div>
        <div className="prec-pile-group">
          <div className="prec-label">Waste</div>
          {wasteTop ? (
            <Card card={wasteTop} />
          ) : (
            <div className="prec-placeholder">—</div>
          )}
          {wasteTop && (
            <>
              <button className="prec-btn" onClick={() => dispatch({ type: "waste-to-foundation" } as PrecedenceAction)}>
                → Found
              </button>
              <button
                className="prec-btn"
                disabled={emptyReserveIdx === -1}
                onClick={() => emptyReserveIdx !== -1 && dispatch({ type: "waste-to-reserve", reserveIdx: emptyReserveIdx } as PrecedenceAction)}
              >
                → Reserve
              </button>
            </>
          )}
        </div>
      </div>

      <div className="prec-section">Reserve (8 slots)</div>
      <div className="prec-row">
        {state.reserve.map((card, i) => (
          <div key={i} className="prec-pile-group">
            {card ? (
              <Card card={card} />
            ) : (
              <div className="prec-placeholder">Empty</div>
            )}
            {card && (
              <button
                className="prec-btn"
                onClick={() => dispatch({ type: "reserve-to-foundation", reserveIdx: i } as PrecedenceAction)}
              >
                → Found
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
