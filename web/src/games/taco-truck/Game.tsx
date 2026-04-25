import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TacoState, TacoAction, Filling } from "./state.js";
import { isTerminal, TOTAL_DAYS, FILLINGS, SALSA_COST, LOCATION_COST } from "./state.js";
import "./Game.css";

export function TacoTruck({
  state,
  dispatch,
  onGameOver,
}: GameProps<TacoState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: TacoAction) => dispatch(a);
  const estCost = Math.round(state.tacoCount * FILLINGS[state.filling].cost);

  return (
    <div className="taco-wrap">
      <div className="taco-header">
        <span className="taco-title">🌮 Taco Truck</span>
        <span className="taco-day">Day {state.day}/{TOTAL_DAYS}</span>
        <span className="taco-cash">${state.cash}</span>
      </div>

      <div className="taco-upgrades">
        <div className="taco-upgrade-item">Salsa: {state.salsaLevel}/3</div>
        <div className="taco-upgrade-item">Location: {state.locationLevel}/3</div>
      </div>

      {state.phase === "plan" && (
        <div className="taco-plan">
          <label>
            Taco count: <strong>{state.tacoCount} tacos</strong>
            <input type="range" min={1} max={60} step={5} value={state.tacoCount}
              onChange={e => d({ type: "setCount", value: +e.target.value })} />
          </label>
          <label>
            Price per taco: <strong>${state.tacoPrice}</strong>
            <input type="range" min={2} max={10} step={1} value={state.tacoPrice}
              onChange={e => d({ type: "setPrice", value: +e.target.value })} />
          </label>
          <div>
            <div style={{ fontSize: "0.85rem", marginBottom: 6 }}>Filling:</div>
            <div className="taco-fillings">
              {(Object.keys(FILLINGS) as Filling[]).map(f => (
                <button key={f}
                  className={`taco-filling-btn${state.filling === f ? " active" : ""}`}
                  onClick={() => d({ type: "setFilling", value: f })}>
                  {FILLINGS[f].label}
                </button>
              ))}
            </div>
          </div>
          <div className="taco-invest">
            <button className="taco-invest-btn"
              disabled={state.salsaLevel >= 3 || state.cash < SALSA_COST}
              onClick={() => d({ type: "buySalsa" })}>
              Better Salsa ${SALSA_COST}
            </button>
            <button className="taco-invest-btn"
              disabled={state.locationLevel >= 3 || state.cash < LOCATION_COST}
              onClick={() => d({ type: "buyLocation" })}>
              Better Spot ${LOCATION_COST}
            </button>
          </div>
          <div className="taco-cost-preview">Est. cost: ~${estCost} | Profit if sold out: ~${state.tacoCount * state.tacoPrice - estCost}</div>
          <button className="taco-btn" onClick={() => d({ type: "openDay" })}>Open for Business!</button>
        </div>
      )}

      {state.phase === "results" && (
        <div className="taco-results">
          <div className="taco-result-row">Prepared: {state.tacoCount} tacos</div>
          <div className="taco-result-row">Sold: <strong>{state.lastSold}</strong></div>
          <div className="taco-result-row">Revenue: ${state.lastRevenue}</div>
          <div className="taco-result-row">Cost: ${state.lastCost}</div>
          <div className={`taco-result-row profit ${state.lastProfit >= 0 ? "pos" : "neg"}`}>
            Profit: {state.lastProfit >= 0 ? "+" : ""}${state.lastProfit}
          </div>
          <button className="taco-btn" onClick={() => d({ type: "nextDay" })}>
            {state.day >= TOTAL_DAYS ? "Close Truck" : "Next Day →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="taco-done">
          <div className="taco-final">Final Cash: <strong>${state.cash}</strong></div>
          <div>{state.cash >= 1200 ? "Taco Legend!" : state.cash >= 600 ? "Great Truck!" : "Keep rolling!"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="taco-log">
          {[...state.log].reverse().map((l, i) => <div key={i} className="taco-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
