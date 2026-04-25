import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AirlineState, AirlineAction, Route } from "./state.js";
import { isTerminal, TOTAL_QUARTERS, ROUTES, PLANE_COST, MAINTENANCE_COST, FUEL_HEDGE_COST } from "./state.js";
import "./Game.css";

export function AirlineSim({
  state,
  dispatch,
  onGameOver,
}: GameProps<AirlineState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: AirlineAction) => dispatch(a);
  const totalFlights = state.fleet * 45;
  const estCost = Math.round(totalFlights * ROUTES[state.activeRoute].costPerFlight);

  return (
    <div className="air-wrap">
      <div className="air-header">
        <span className="air-title">✈️ Airline Sim</span>
        <span className="air-quarter">Q{state.quarter}/{TOTAL_QUARTERS}</span>
        <span className="air-cash">${state.cash.toLocaleString()}</span>
      </div>

      <div className="air-stats">
        <div className="air-badge">Fleet: {state.fleet} planes</div>
        <div className="air-badge">Maintenance: {state.maintenanceLevel}/3</div>
        <div className="air-badge">Safety: {state.safetyRating}%</div>
      </div>

      {state.phase === "plan" && (
        <div className="air-plan">
          <label>
            Ticket Price: <strong>${state.ticketPrice}/seat</strong>
            <input type="range" min={50} max={400} step={10} value={state.ticketPrice}
              onChange={e => d({ type: "setPrice", value: +e.target.value })} />
          </label>
          <div>
            <div style={{ fontSize: "0.85rem", marginBottom: 6 }}>Active Route:</div>
            <div className="air-routes">
              {(Object.keys(ROUTES) as Route[]).map(r => (
                <button key={r}
                  className={`air-route-btn${state.activeRoute === r ? " active" : ""}`}
                  onClick={() => d({ type: "setRoute", value: r })}>
                  {ROUTES[r].label}
                </button>
              ))}
            </div>
          </div>
          <div className="air-invest">
            <button className="air-invest-btn"
              disabled={state.fleet >= 8 || state.cash < PLANE_COST}
              onClick={() => d({ type: "buyPlane" })}>
              +Plane (${PLANE_COST})
            </button>
            <button className="air-invest-btn"
              disabled={state.maintenanceLevel >= 3 || state.cash < MAINTENANCE_COST}
              onClick={() => d({ type: "upgradeMaintenance" })}>
              Maintenance (${MAINTENANCE_COST})
            </button>
            <button
              className={`air-invest-btn${state.fuelHedged ? " active" : ""}`}
              disabled={!state.fuelHedged && state.cash < FUEL_HEDGE_COST}
              onClick={() => d({ type: "toggleFuelHedge" })}>
              {state.fuelHedged ? "✓ Fuel Hedged" : `Hedge Fuel ($${FUEL_HEDGE_COST})`}
            </button>
          </div>
          <div style={{ fontSize: "0.82rem", color: "#888" }}>
            {totalFlights} flights planned | Est. cost: ~${estCost.toLocaleString()}
          </div>
          <button className="air-btn" onClick={() => d({ type: "fly" })}>Fly This Quarter!</button>
        </div>
      )}

      {state.phase === "results" && (
        <div className="air-results">
          <div className="air-result-row">Flights operated: {state.lastFlights}</div>
          <div className="air-result-row">Revenue: ${state.lastRevenue.toLocaleString()}</div>
          <div className="air-result-row">Operating costs: ${state.lastCost.toLocaleString()}</div>
          <div className={`air-result-row profit ${state.lastProfit >= 0 ? "pos" : "neg"}`}>
            Profit: {state.lastProfit >= 0 ? "+" : ""}${state.lastProfit.toLocaleString()}
          </div>
          <button className="air-btn" onClick={() => d({ type: "nextQuarter" })}>
            {state.quarter >= TOTAL_QUARTERS ? "Final Report" : "Next Quarter →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="air-done">
          <div className="air-final">Final Cash: <strong>${state.cash.toLocaleString()}</strong></div>
          <div>{state.cash >= 8000 ? "🏆 Major Airline!" : state.cash >= 3000 ? "👍 Profitable routes!" : "📉 Grounded finances"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="air-log">
          {[...state.log].reverse().map((l, i) => <div key={i} className="air-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
