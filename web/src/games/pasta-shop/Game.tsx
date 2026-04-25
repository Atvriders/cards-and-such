import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PastaState, PastaAction, PastaType } from "./state.js";
import { isTerminal, TOTAL_DAYS, PASTAS, SAUCE_COST, MARKETING_COST } from "./state.js";
import "./Game.css";

export function PastaShop({
  state,
  dispatch,
  onGameOver,
}: GameProps<PastaState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: PastaAction) => dispatch(a);
  const estCost = Math.round(state.batchSize * PASTAS[state.pasta].cost);

  return (
    <div className="pasta-wrap">
      <div className="pasta-header">
        <span className="pasta-title">Pasta Shop</span>
        <span className="pasta-day">Day {state.day}/{TOTAL_DAYS}</span>
        <span className="pasta-cash">${state.cash}</span>
      </div>

      <div className="pasta-upgrades">
        <div className="pasta-upgrade-item">Sauce: {state.sauceLevel}/3</div>
        <div className="pasta-upgrade-item">Marketing: {state.marketingLevel}/3</div>
      </div>

      {state.phase === "plan" && (
        <div className="pasta-plan">
          <label>
            Batch size: <strong>{state.batchSize} portions</strong>
            <input type="range" min={1} max={70} step={5} value={state.batchSize}
              onChange={e => d({ type: "setBatch", value: +e.target.value })} />
          </label>
          <label>
            Price per portion: <strong>${state.portionPrice}</strong>
            <input type="range" min={3} max={14} step={1} value={state.portionPrice}
              onChange={e => d({ type: "setPrice", value: +e.target.value })} />
          </label>
          <div>
            <div style={{ fontSize: "0.85rem", marginBottom: 6 }}>Pasta Type:</div>
            <div className="pasta-types">
              {(Object.keys(PASTAS) as PastaType[]).map(p => (
                <button key={p}
                  className={`pasta-type-btn${state.pasta === p ? " active" : ""}`}
                  onClick={() => d({ type: "setPasta", value: p })}>
                  {PASTAS[p].label}
                </button>
              ))}
            </div>
          </div>
          <div className="pasta-invest">
            <button className="pasta-invest-btn"
              disabled={state.sauceLevel >= 3 || state.cash < SAUCE_COST}
              onClick={() => d({ type: "buySauce" })}>
              Better Sauce ${SAUCE_COST}
            </button>
            <button className="pasta-invest-btn"
              disabled={state.marketingLevel >= 3 || state.cash < MARKETING_COST}
              onClick={() => d({ type: "buyMarketing" })}>
              Marketing ${MARKETING_COST}
            </button>
          </div>
          <div className="pasta-cost-preview">Est. cost: ~${estCost} | Profit if sold out: ~${state.batchSize * state.portionPrice - estCost}</div>
          <button className="pasta-btn" onClick={() => d({ type: "openDay" })}>Open for Lunch!</button>
        </div>
      )}

      {state.phase === "results" && (
        <div className="pasta-results">
          <div className="pasta-result-row">Prepared: {state.batchSize} portions</div>
          <div className="pasta-result-row">Sold: <strong>{state.lastSold}</strong></div>
          <div className="pasta-result-row">Revenue: ${state.lastRevenue}</div>
          <div className="pasta-result-row">Cost: ${state.lastCost}</div>
          <div className={`pasta-result-row profit ${state.lastProfit >= 0 ? "pos" : "neg"}`}>
            Profit: {state.lastProfit >= 0 ? "+" : ""}${state.lastProfit}
          </div>
          <button className="pasta-btn" onClick={() => d({ type: "nextDay" })}>
            {state.day >= TOTAL_DAYS ? "Close Shop" : "Next Day →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="pasta-done">
          <div className="pasta-final">Final Cash: <strong>${state.cash}</strong></div>
          <div>{state.cash >= 1400 ? "Pasta Master!" : state.cash >= 700 ? "Solid Trattoria!" : "Keep cooking!"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="pasta-log">
          {[...state.log].reverse().map((l, i) => <div key={i} className="pasta-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
