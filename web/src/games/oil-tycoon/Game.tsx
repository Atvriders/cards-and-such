import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OilState, OilAction } from "./state.js";
import { isTerminal, TOTAL_QUARTERS, REFINERY_COST, PROSPECT_COST } from "./state.js";
import "./Game.css";

export function OilTycoon({
  state,
  dispatch,
  onGameOver,
}: GameProps<OilState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: OilAction) => dispatch(a);

  return (
    <div className="oil-wrap">
      <div className="oil-header">
        <span className="oil-title">🛢️ Oil Tycoon</span>
        <span className="oil-quarter">Q{state.quarter}/{TOTAL_QUARTERS}</span>
        <span className="oil-cash">${state.cash.toLocaleString()}</span>
      </div>

      <div className="oil-stats">
        <div className="oil-badge">Wells: {state.wells}</div>
        <div className="oil-badge">Refinery: Lv{state.refinery}/3</div>
      </div>

      {state.phase !== "done" && (
        <div className="oil-market">
          📊 Market price last quarter: <strong>${state.marketPrice}/barrel</strong>
        </div>
      )}

      {state.phase === "plan" && (
        <div className="oil-plan">
          <label>
            Sell Price: <strong>${state.sellPrice}/barrel</strong>
            <input type="range" min={20} max={100} step={5} value={state.sellPrice}
              onChange={e => d({ type: "setSellPrice", value: +e.target.value })} />
          </label>
          <div style={{ fontSize: "0.82rem", color: "#888" }}>
            {state.sellPrice <= state.marketPrice
              ? "Below market — expect full sales"
              : "Above market — some buyers will walk away"}
          </div>
          <div className="oil-invest">
            <button className="oil-invest-btn"
              disabled={state.refinery >= 3 || state.cash < REFINERY_COST}
              onClick={() => d({ type: "upgradeRefinery" })}>
              Upgrade Refinery (${REFINERY_COST})
            </button>
            <button
              className={`oil-invest-btn${state.prospecting ? " active" : ""}`}
              disabled={!state.prospecting && state.cash < PROSPECT_COST}
              onClick={() => d({ type: "toggleProspect" })}>
              {state.prospecting ? "✓ Prospecting" : `Prospect (${PROSPECT_COST})`}
            </button>
          </div>
          <div style={{ fontSize: "0.82rem", color: "#888" }}>
            Est. production: ~{state.wells * 300 * (1 + state.refinery * 0.15) | 0} barrels/quarter
            | Op cost: ${state.wells * 80}
          </div>
          <button className="oil-btn" onClick={() => d({ type: "pump" })}>Pump This Quarter!</button>
        </div>
      )}

      {state.phase === "results" && (
        <div className="oil-results">
          <div className="oil-result-row">Market price: ${state.marketPrice}/barrel</div>
          <div className="oil-result-row">Sold: <strong>{state.barrelsSold.toLocaleString()} barrels</strong> @ ${state.sellPrice}</div>
          <div className="oil-result-row">Revenue: ${state.lastRevenue.toLocaleString()}</div>
          <div className="oil-result-row">Operating costs: ${state.lastCost.toLocaleString()}</div>
          <div className={`oil-result-row profit ${state.lastProfit >= 0 ? "pos" : "neg"}`}>
            Profit: {state.lastProfit >= 0 ? "+" : ""}${state.lastProfit.toLocaleString()}
          </div>
          <button className="oil-btn" onClick={() => d({ type: "nextQuarter" })}>
            {state.quarter >= TOTAL_QUARTERS ? "Final Report" : "Next Quarter →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="oil-done">
          <div className="oil-final">Final Cash: ${state.cash.toLocaleString()}</div>
          <div>{state.cash >= 6000 ? "🏆 Oil Baron!" : state.cash >= 3000 ? "👍 Solid operator!" : "📉 Dry wells"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="oil-log">
          {[...state.log].reverse().map((l, i) => <div key={i} className="oil-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
