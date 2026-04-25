import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BakeryState, BakeryAction, Item } from "./state.js";
import { isTerminal, TOTAL_DAYS, ITEMS, OVEN_UPGRADE_COST, MAX_TOTAL_BAKE, totalBake } from "./state.js";
import "./Game.css";

const ITEM_LIST = Object.keys(ITEMS) as Item[];

export function BakeryShop({
  state,
  dispatch,
  onGameOver,
}: GameProps<BakeryState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: BakeryAction) => dispatch(a);
  const capacity = MAX_TOTAL_BAKE + state.ovenLevel * 20;
  const used = totalBake(state.bake);

  return (
    <div className="bake-wrap">
      <div className="bake-header">
        <span className="bake-title">🥐 Bakery Shop</span>
        <span className="bake-day">Day {state.day}/{TOTAL_DAYS}</span>
        <span className="bake-cash">${state.cash}</span>
      </div>

      <div className="bake-info">
        <div className="bake-badge">Oven: Lv{state.ovenLevel}/3 (cap {capacity})</div>
        {state.phase === "plan" && (
          <button className="bake-oven-btn"
            disabled={state.ovenLevel >= 3 || state.cash < OVEN_UPGRADE_COST}
            onClick={() => d({ type: "upgradeOven" })}>
            Upgrade Oven (${OVEN_UPGRADE_COST})
          </button>
        )}
      </div>

      {state.phase === "plan" && (
        <div>
          <div className="bake-capacity" style={{ marginBottom: 6 }}>
            Batch: {used}/{capacity} items
          </div>
          <div className="bake-items">
            {ITEM_LIST.map(item => (
              <div key={item} className="bake-item-row">
                <div className="bake-item-title">
                  <span>{ITEMS[item].label}</span>
                  <button
                    className={`bake-featured-btn${state.featured === item ? " active" : ""}`}
                    onClick={() => d({ type: "setFeatured", value: item })}>
                    {state.featured === item ? "★ Featured" : "Feature"}
                  </button>
                </div>
                <div className="bake-item-controls">
                  <span>Bake:</span>
                  <input type="range" min={0} max={50} step={1} value={state.bake[item]}
                    onChange={e => d({ type: "setBake", item, value: +e.target.value })} />
                  <span><strong>{state.bake[item]}</strong></span>
                </div>
                <div className="bake-item-controls">
                  <span>Price:</span>
                  <input type="range" min={1} max={ITEMS[item].maxPrice} step={1} value={state.price[item]}
                    onChange={e => d({ type: "setPrice", item, value: +e.target.value })} />
                  <span><strong>${state.price[item]}</strong></span>
                </div>
              </div>
            ))}
          </div>
          <button className="bake-btn" style={{ marginTop: 10, width: "100%" }}
            onClick={() => d({ type: "openDay" })}>Open Bakery!</button>
        </div>
      )}

      {state.phase === "results" && (
        <div>
          <div className="bake-results-grid">
            <div className="header">Item</div>
            <div className="header">Sold</div>
            <div className="header">Revenue</div>
            {ITEM_LIST.map(item => (
              <>
                <div key={`${item}-name`}>{ITEMS[item].label}</div>
                <div key={`${item}-sold`}>{state.lastSoldMap[item]}</div>
                <div key={`${item}-rev`}>${state.lastSoldMap[item] * state.price[item]}</div>
              </>
            ))}
          </div>
          <div className="bake-totals">
            <div>Revenue: ${state.lastRevenue} | Cost: ${state.lastCost}</div>
            <div className={`bake-profit ${state.lastProfit >= 0 ? "pos" : "neg"}`}>
              Profit: {state.lastProfit >= 0 ? "+" : ""}${state.lastProfit}
            </div>
          </div>
          <button className="bake-btn" style={{ marginTop: 10, width: "100%" }}
            onClick={() => d({ type: "nextDay" })}>
            {state.day >= TOTAL_DAYS ? "Final Tally" : "Next Day →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="bake-done">
          <div className="bake-final">Final Cash: <strong>${state.cash}</strong></div>
          <div>{state.cash >= 1200 ? "🏆 Master Baker!" : state.cash >= 600 ? "👍 Sweet success!" : "📉 Doughn't give up!"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="bake-log">
          {[...state.log].reverse().map((l, i) => <div key={i} className="bake-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
