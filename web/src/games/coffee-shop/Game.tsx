import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CoffeeState, CoffeeAction, Drink } from "./state.js";
import { isTerminal, TOTAL_DAYS, DRINKS, LOYALTY_COST, UPGRADE_COST } from "./state.js";
import "./Game.css";

export function CoffeeShop({
  state,
  dispatch,
  onGameOver,
}: GameProps<CoffeeState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: CoffeeAction) => dispatch(a);
  const costPerCup = DRINKS[state.featured].costPerCup;
  const estCost = Math.round(state.batchSize * costPerCup);

  return (
    <div className="cafe-wrap">
      <div className="cafe-header">
        <span className="cafe-title">☕ Coffee Shop</span>
        <span className="cafe-day">Day {state.day}/{TOTAL_DAYS}</span>
        <span className="cafe-cash">${state.cash}</span>
      </div>

      <div className="cafe-upgrades">
        <div className="cafe-upgrade-item">Loyalty: {state.loyalty}/3</div>
        <div className="cafe-upgrade-item">Equipment: {state.upgradeLevel}/3</div>
      </div>

      {state.phase === "plan" && (
        <div className="cafe-plan">
          <label>
            Batch size: <strong>{state.batchSize} cups</strong>
            <input type="range" min={1} max={80} step={5} value={state.batchSize}
              onChange={e => d({ type: "setBatch", value: +e.target.value })} />
          </label>
          <label>
            Price per cup: <strong>${state.drinkPrice}</strong>
            <input type="range" min={2} max={12} step={1} value={state.drinkPrice}
              onChange={e => d({ type: "setPrice", value: +e.target.value })} />
          </label>
          <div>
            <div style={{ fontSize: "0.85rem", marginBottom: 6 }}>Featured Drink:</div>
            <div className="cafe-drinks">
              {(Object.keys(DRINKS) as Drink[]).map(dr => (
                <button key={dr}
                  className={`cafe-drink-btn${state.featured === dr ? " active" : ""}`}
                  onClick={() => d({ type: "setDrink", value: dr })}>
                  {DRINKS[dr].label}
                </button>
              ))}
            </div>
          </div>
          <div className="cafe-invest">
            <button className="cafe-invest-btn"
              disabled={state.loyalty >= 3 || state.cash < LOYALTY_COST}
              onClick={() => d({ type: "buyLoyalty" })}>
              Loyalty Program ${LOYALTY_COST}
            </button>
            <button className="cafe-invest-btn"
              disabled={state.upgradeLevel >= 3 || state.cash < UPGRADE_COST}
              onClick={() => d({ type: "buyUpgrade" })}>
              Upgrade Equipment ${UPGRADE_COST}
            </button>
          </div>
          <div className="cafe-cost-preview">Est. cost: ~${estCost} | Profit if sold out: ~${state.batchSize * state.drinkPrice - estCost}</div>
          <button className="cafe-btn" onClick={() => d({ type: "openDay" })}>Open Shop!</button>
        </div>
      )}

      {state.phase === "results" && (
        <div className="cafe-results">
          <div className="cafe-result-row">Prepared: {state.batchSize} cups</div>
          <div className="cafe-result-row">Sold: <strong>{state.lastSold}</strong></div>
          <div className="cafe-result-row">Revenue: ${state.lastRevenue}</div>
          <div className="cafe-result-row">Cost (ingredients + waste): ${state.lastCost}</div>
          <div className={`cafe-result-row profit ${state.lastProfit >= 0 ? "pos" : "neg"}`}>
            Profit: {state.lastProfit >= 0 ? "+" : ""}${state.lastProfit}
          </div>
          <button className="cafe-btn" onClick={() => d({ type: "nextDay" })}>
            {state.day >= TOTAL_DAYS ? "Close Shop" : "Next Day →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="cafe-done">
          <div className="cafe-final">Final Cash: <strong>${state.cash}</strong></div>
          <div>{state.cash >= 1500 ? "⭐ Top Barista!" : state.cash >= 700 ? "👍 Cozy cafe success!" : "📉 Needs more customers"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="cafe-log">
          {[...state.log].reverse().map((l, i) => <div key={i} className="cafe-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
