import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BetsyRossState, BetsyRossAction } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Game.css";

const noSettings = {} as const;
type NoSettings = typeof noSettings;

export function BetsyRossGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<BetsyRossState, NoSettings>): JSX.Element {
  if (state.won) onGameOver(Math.max(0, 500 - state.movesMade));

  const wasteTop = state.waste.length > 0 ? state.waste[state.waste.length - 1]! : null;

  return (
    <div className="betsy-ross">
      <div className="br-info">
        <span>Moves: {state.movesMade}</span>
        <span>Stock: {state.stock.length}</span>
        <span>Waste: {state.waste.length}</span>
      </div>

      <div className="br-section">Foundations (build up by 2: A,3,5,7,9,J,K,2,4,6,8,10,Q)</div>
      <div className="br-row">
        {state.foundations.map((f, i) => {
          const top = f.length > 0 ? f[f.length - 1]! : null;
          const next = state.bases[i]!.nextRank;
          return (
            <div key={i} className="br-pile-group">
              <div className="br-label">{f[0]?.suit} next: {next === -1 ? "done" : rankLabel(next as any)}</div>
              {top ? <Card card={top} /> : <div className="br-placeholder">A</div>}
              <div className="br-label">{f.length}/13</div>
            </div>
          );
        })}
      </div>

      <div className="br-section">Stock &amp; Waste</div>
      <div className="br-row">
        <div className="br-pile-group">
          <div className="br-label">Stock</div>
          {state.stock.length > 0 ? (
            <Card faceDown onClick={() => dispatch({ type: "draw" } as BetsyRossAction)} />
          ) : (
            <div
              className="br-placeholder"
              style={{ cursor: state.waste.length > 0 ? "pointer" : "default" }}
              onClick={() => state.waste.length > 0 && dispatch({ type: "draw" } as BetsyRossAction)}
            >
              {state.waste.length > 0 ? "Redeal" : "Empty"}
            </div>
          )}
        </div>
        <div className="br-pile-group">
          <div className="br-label">Waste</div>
          {wasteTop ? (
            <Card card={wasteTop} onClick={() => dispatch({ type: "move-waste-to-foundation" } as BetsyRossAction)} />
          ) : (
            <div className="br-placeholder">—</div>
          )}
          {wasteTop && (
            <button
              className="br-btn"
              onClick={() => dispatch({ type: "move-waste-to-foundation" } as BetsyRossAction)}
            >
              → Found
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
