import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ResourceChainState, ResourceChainAction } from "./state.js";
import { isTerminal, TOTAL_TURNS } from "./state.js";
import "./Game.css";

export function ResourceChain({ state, dispatch, onGameOver }: GameProps<ResourceChainState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: ResourceChainAction) => dispatch(a);

  return (
    <div className="rc-wrap">
      <div className="rc-header">
        <span className="rc-title">⚙️ Resource Chain</span>
        <span className="rc-turn">Turn {state.turn}/{TOTAL_TURNS}</span>
        <span className="rc-coins">Coins: {state.coins}</span>
        <span className="rc-demand">Demand: x{state.demandMultiplier.toFixed(1)}</span>
      </div>

      <div className="rc-resources">
        <div className="rc-res-row"><span>🌱 Seeds</span><span>{state.resources.seeds}</span></div>
        <div className="rc-res-row"><span>🌿 Crops</span><span>{state.resources.crops}</span></div>
        <div className="rc-res-row"><span>🌾 Flour</span><span>{state.resources.flour}</span></div>
        <div className="rc-res-row"><span>🍞 Bread</span><span>{state.resources.bread}</span></div>
      </div>

      {state.phase === "action" && (
        <div className="rc-actions">
          <div className="rc-action-group">
            <span className="rc-action-label">Buy Seeds (5c each)</span>
            <div className="rc-btns">
              {[1, 3, 5].map(q => (
                <button key={q} className="rc-btn rc-buy"
                  disabled={state.coins < 5 * q}
                  onClick={() => d({ type: "buy", resource: "seeds", qty: q })}>
                  +{q}
                </button>
              ))}
            </div>
          </div>
          <div className="rc-action-group">
            <span className="rc-action-label">Plant Seeds → Crops (1 seed = 2 crops)</span>
            <div className="rc-btns">
              {[1, 3, 5].map(q => (
                <button key={q} className="rc-btn rc-process"
                  disabled={state.resources.seeds < q}
                  onClick={() => d({ type: "process", from: "seeds", qty: q })}>
                  {q} seeds
                </button>
              ))}
            </div>
          </div>
          <div className="rc-action-group">
            <span className="rc-action-label">Mill Crops → Flour (2 crops = 1 flour)</span>
            <div className="rc-btns">
              {[2, 6, 10].map(q => (
                <button key={q} className="rc-btn rc-process"
                  disabled={state.resources.crops < q}
                  onClick={() => d({ type: "process", from: "crops", qty: q })}>
                  {q} crops
                </button>
              ))}
            </div>
          </div>
          <div className="rc-action-group">
            <span className="rc-action-label">Bake Flour → Bread (1 flour = 1 bread)</span>
            <div className="rc-btns">
              {[1, 3, 5].map(q => (
                <button key={q} className="rc-btn rc-process"
                  disabled={state.resources.flour < q}
                  onClick={() => d({ type: "process", from: "flour", qty: q })}>
                  {q} flour
                </button>
              ))}
            </div>
          </div>
          <div className="rc-action-group">
            <span className="rc-action-label">Sell Bread ({Math.round(20 * state.demandMultiplier)}c each at current demand)</span>
            <div className="rc-btns">
              {[1, 3, 5].map(q => (
                <button key={q} className="rc-btn rc-sell"
                  disabled={state.resources.bread < q}
                  onClick={() => d({ type: "sell", qty: q })}>
                  -{q}
                </button>
              ))}
            </div>
          </div>
          <button className="rc-advance" onClick={() => d({ type: "endTurn" })}>
            {state.turn >= TOTAL_TURNS ? "Finish Game" : "End Turn →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="rc-done">
          <div>Final Coins: <strong>{state.coins}</strong></div>
          <div>{state.coins >= 300 ? "🏆 Master Producer!" : state.coins >= 150 ? "👍 Solid Chain!" : "🌱 Keep practicing!"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="rc-log">
          {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i} className="rc-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
