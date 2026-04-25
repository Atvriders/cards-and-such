import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpaceTraderState, SpaceTraderAction, Good } from "./state.js";
import { isTerminal, GOODS, TOTAL_JUMPS, cargoTotal } from "./state.js";
import "./Game.css";

const GOOD_LIST = Object.keys(GOODS) as Good[];

export function SpaceTraderGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<SpaceTraderState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [qty, setQty] = useState<Record<Good, number>>({ food: 1, tech: 1, ore: 1, medicine: 1 });
  const d = (a: SpaceTraderAction) => dispatch(a);
  const cargoUsed = cargoTotal(state.cargo);

  return (
    <div className="st-wrap">
      <div className="st-header">
        <span className="st-title">🚀 Space Trader</span>
        <span className="st-planet">📍 {state.planet}</span>
        <span>Jump {state.jump}/{TOTAL_JUMPS}</span>
        <span className="st-credits">${state.credits}</span>
      </div>

      <div className="st-stats">
        <div className="st-stat">
          <div className="st-stat-label">Fuel</div>
          <div className="st-stat-val">{state.fuel}</div>
        </div>
        <div className="st-stat">
          <div className="st-stat-label">Cargo</div>
          <div className="st-stat-val">{cargoUsed}/20</div>
        </div>
      </div>

      {state.phase === "port" && (
        <div>
          <div className="st-market">
            <div className="st-market-title">Market Prices</div>
            {GOOD_LIST.map(g => (
              <div key={g} className="st-good-row">
                <span className="st-good-name">{GOODS[g].label}</span>
                <span className="st-good-price">${state.prices[g]}</span>
                <span className="st-good-cargo">x{state.cargo[g]}</span>
                <input
                  type="number" min={1} max={10} value={qty[g]}
                  style={{ width: 40 }}
                  onChange={e => setQty(q => ({ ...q, [g]: Math.max(1, +e.target.value) }))} />
                <button className="st-qty-btn"
                  disabled={state.credits < state.prices[g] * qty[g] || cargoUsed + qty[g] > 20}
                  onClick={() => d({ type: "buy", good: g, qty: qty[g] })}>Buy</button>
                <button className="st-qty-btn"
                  disabled={state.cargo[g] < qty[g]}
                  onClick={() => d({ type: "sell", good: g, qty: qty[g] })}>Sell</button>
              </div>
            ))}
          </div>
          <div className="st-actions">
            <button className="st-btn st-btn-jump"
              disabled={state.fuel < 3}
              onClick={() => d({ type: "jump" })}>
              Hyperspace Jump (⛽3)
            </button>
            <button className="st-btn st-btn-refuel"
              disabled={state.credits < 30}
              onClick={() => d({ type: "refuel" })}>
              Refuel ($30)
            </button>
          </div>
        </div>
      )}

      {state.phase === "done" && (
        <div className="st-done">
          <div className="st-final">Credits: ${state.credits}</div>
          <div>{state.credits >= 600 ? "🏆 Trade Baron!" : state.credits >= 300 ? "👍 Profitable voyage!" : "💸 Keep flying!"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="st-log">
          {[...state.log].reverse().slice(0, 8).map((l, i) => <div key={i} className="st-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
