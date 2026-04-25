import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DonutState, DonutAction, DonutFlavor } from "./state.js";
import { isTerminal, TOTAL_DAYS, FLAVORS, GLAZE_COST, DISPLAY_COST } from "./state.js";
import "./Game.css";

export function DonutShop({
  state,
  dispatch,
  onGameOver,
}: GameProps<DonutState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: DonutAction) => dispatch(a);
  const estCost = Math.round(state.dozenCount * FLAVORS[state.flavor].cost);

  return (
    <div className="donut-wrap">
      <div className="donut-header">
        <span className="donut-title">Donut Shop</span>
        <span className="donut-day">Day {state.day}/{TOTAL_DAYS}</span>
        <span className="donut-cash">${state.cash}</span>
      </div>

      <div className="donut-upgrades">
        <div className="donut-upgrade-item">Glaze: {state.glazeLevel}/3</div>
        <div className="donut-upgrade-item">Display: {state.displayLevel}/3</div>
      </div>

      {state.phase === "plan" && (
        <div className="donut-plan">
          <label>
            Dozens to bake: <strong>{state.dozenCount} dz</strong>
            <input type="range" min={1} max={20} step={1} value={state.dozenCount}
              onChange={e => d({ type: "setDozens", value: +e.target.value })} />
          </label>
          <label>
            Price per dozen: <strong>${state.donutPrice}</strong>
            <input type="range" min={4} max={18} step={1} value={state.donutPrice}
              onChange={e => d({ type: "setPrice", value: +e.target.value })} />
          </label>
          <div>
            <div style={{ fontSize: "0.85rem", marginBottom: 6 }}>Flavor:</div>
            <div className="donut-flavors">
              {(Object.keys(FLAVORS) as DonutFlavor[]).map(f => (
                <button key={f}
                  className={`donut-flavor-btn${state.flavor === f ? " active" : ""}`}
                  onClick={() => d({ type: "setFlavor", value: f })}>
                  {FLAVORS[f].label}
                </button>
              ))}
            </div>
          </div>
          <div className="donut-invest">
            <button className="donut-invest-btn"
              disabled={state.glazeLevel >= 3 || state.cash < GLAZE_COST}
              onClick={() => d({ type: "buyGlaze" })}>
              Better Glaze ${GLAZE_COST}
            </button>
            <button className="donut-invest-btn"
              disabled={state.displayLevel >= 3 || state.cash < DISPLAY_COST}
              onClick={() => d({ type: "buyDisplay" })}>
              Display Case ${DISPLAY_COST}
            </button>
          </div>
          <div className="donut-cost-preview">Est. cost: ~${estCost} | If sold out: ~${state.dozenCount * state.donutPrice - estCost}</div>
          <button className="donut-btn" onClick={() => d({ type: "openDay" })}>Open Bakery!</button>
        </div>
      )}

      {state.phase === "results" && (
        <div className="donut-results">
          <div className="donut-result-row">Baked: {state.dozenCount} dozens</div>
          <div className="donut-result-row">Sold: <strong>{state.lastSold} dz</strong></div>
          <div className="donut-result-row">Revenue: ${state.lastRevenue}</div>
          <div className="donut-result-row">Cost: ${state.lastCost}</div>
          <div className={`donut-result-row profit ${state.lastProfit >= 0 ? "pos" : "neg"}`}>
            Profit: {state.lastProfit >= 0 ? "+" : ""}${state.lastProfit}
          </div>
          <button className="donut-btn" onClick={() => d({ type: "nextDay" })}>
            {state.day >= TOTAL_DAYS ? "Close Up" : "Next Day →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="donut-done">
          <div className="donut-final">Final Cash: <strong>${state.cash}</strong></div>
          <div>{state.cash >= 1000 ? "Donut Legend!" : state.cash >= 500 ? "Sweet Success!" : "Keep glazing!"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="donut-log">
          {[...state.log].reverse().map((l, i) => <div key={i} className="donut-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
