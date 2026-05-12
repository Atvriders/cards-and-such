import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RestaurantState, RestaurantAction, Meal } from "./state.js";
import { isTerminal, TOTAL_DAYS, MEALS } from "./state.js";
import "./Game.css";

export function RestaurantTycoon({
  state,
  dispatch,
  onGameOver,
}: GameProps<RestaurantState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: RestaurantAction) => dispatch(a);
  const staffCost = state.staff * 20;
  const estimatedCost = staffCost + state.marketing + Math.round(state.staff * 8 * state.menuPrice * 0.3 * MEALS[state.featuredMeal].costMult);

  return (
    <div className="rest-wrap fade-in">
      <div className="rest-header">
        <span className="rest-title">🍽️ Restaurant Tycoon</span>
        <span className="rest-day">Day {state.day}/{TOTAL_DAYS}</span>
        <span className="rest-cash">${state.cash}</span>
      </div>

      <div className="rest-stats">
        <div className="rest-stat"><span>Reputation</span><strong>{state.reputation}/100</strong></div>
        <div className="rest-stat"><span>Capacity</span><strong>{state.staff * 8} tables</strong></div>
        <div className="rest-stat"><span>Staff</span><strong>{state.staff}</strong></div>
      </div>

      {state.phase === "plan" && (
        <div className="rest-plan">
          <label>
            Staff: <strong>{state.staff}</strong> (${staffCost}/day wages)
            <input type="range" min={1} max={5} step={1} value={state.staff}
              onChange={e => d({ type: "setStaff", value: +e.target.value })} />
          </label>
          <label>
            Menu price: <strong>${state.menuPrice}/meal</strong>
            <input type="range" min={5} max={30} step={1} value={state.menuPrice}
              onChange={e => d({ type: "setPrice", value: +e.target.value })} />
          </label>
          <label>
            Marketing: <strong>${state.marketing}/day</strong>
            <input type="range" min={0} max={50} step={5} value={state.marketing}
              onChange={e => d({ type: "setMarketing", value: +e.target.value })} />
          </label>
          <div>
            <div style={{ fontSize: "0.85rem", marginBottom: 6 }}>Featured Meal:</div>
            <div className="rest-meals">
              {(Object.keys(MEALS) as Meal[]).map(m => (
                <button key={m}
                  className={`rest-meal-btn${state.featuredMeal === m ? " active" : ""}`}
                  onClick={() => d({ type: "setMeal", value: m })}>
                  {MEALS[m].label}
                </button>
              ))}
            </div>
          </div>
          <div className="rest-cost-preview">Est. daily cost: ~${estimatedCost}</div>
          <button className="rest-btn" onClick={() => d({ type: "openDay" })}>Open Restaurant!</button>
        </div>
      )}

      {state.phase === "results" && (
        <div className="rest-results">
          <div className="rest-result-row">Customers served: <strong>{state.lastCustomers}</strong></div>
          <div className="rest-result-row">Revenue: ${state.lastRevenue}</div>
          <div className="rest-result-row">Costs (staff + ingredients + marketing): ${state.lastCosts}</div>
          <div className={`rest-result-row profit ${state.lastProfit >= 0 ? "pos" : "neg"}`}>
            Profit: {state.lastProfit >= 0 ? "+" : ""}${state.lastProfit}
          </div>
          <button className="rest-btn" onClick={() => d({ type: "nextDay" })}>
            {state.day >= TOTAL_DAYS ? "See Final Score" : "Next Day →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="rest-done bounce-in">
          <div className="rest-final">Final Cash: <strong>${state.cash}</strong></div>
          <div>{state.cash >= 2000 ? "⭐ Michelin Star quality!" : state.cash >= 1000 ? "👍 Solid business!" : "📉 Struggled to profit"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="rest-log">
          {[...state.log].reverse().map((l, i) => <div key={i} className="rest-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
