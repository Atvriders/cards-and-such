import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AlchemyShopState, AlchemyShopAction } from "./state.js";
import { isTerminal, ALL_INGREDIENTS, INGREDIENT_LABELS, INGREDIENT_EMOJI, RECIPES, TOTAL_ORDERS, INGREDIENT_COST } from "./state.js";
import "./Game.css";

export function AlchemyShop({ state, dispatch, onGameOver }: GameProps<AlchemyShopState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: AlchemyShopAction) => dispatch(a);

  function canFulfill(orderIdx: number): boolean {
    const order = state.orders[orderIdx];
    if (!order) return false;
    const recipe = RECIPES[order.potion];
    const needed: Partial<Record<string, number>> = {};
    for (const ing of recipe.ingredients) needed[ing] = (needed[ing] ?? 0) + 1;
    return Object.entries(needed).every(([ing, qty]) => state.inventory[ing as keyof typeof state.inventory] >= qty!);
  }

  return (
    <div className="as-wrap">
      <div className="as-header">
        <span className="as-title">⚗️ Alchemy Shop</span>
        <span className="as-orders">Orders: {state.completedOrders}/{TOTAL_ORDERS}</span>
        <span className="as-coins">Coins: {state.coins}</span>
      </div>

      <div className="as-inventory">
        <div className="as-section-label">Inventory ({INGREDIENT_COST}c each)</div>
        <div className="as-ing-grid">
          {ALL_INGREDIENTS.map(ing => (
            <div key={ing} className="as-ing-row">
              <span>{INGREDIENT_EMOJI[ing]} {INGREDIENT_LABELS[ing]}: {state.inventory[ing]}</span>
              <div className="as-ing-btns">
                {[1, 2, 3].map(q => (
                  <button key={q} title={`Buy ${q}`} className="as-buy-btn"
                    disabled={state.coins < INGREDIENT_COST * q}
                    onClick={() => d({ type: "buyIngredient", ingredient: ing, qty: q })}>
                    +{q}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {state.phase !== "done" && (
        <div className="as-orders-section">
          <div className="as-section-label">Active Orders</div>
          {state.orders.map((order, i) => {
            const recipe = RECIPES[order.potion];
            return (
              <div key={i} className={`as-order ${order.turnsLeft <= 1 ? "as-order-urgent" : ""}`}>
                <div className="as-order-top">
                  <span className="as-order-name">{recipe.emoji} {recipe.label}</span>
                  <span className="as-order-timer">⏳{order.turnsLeft}</span>
                  <span className="as-order-reward">{recipe.reward + (order.turnsLeft > 1 ? order.bonus : 0)}c</span>
                </div>
                <div className="as-order-recipe">
                  {recipe.ingredients.map((ing, j) => `${INGREDIENT_EMOJI[ing]}${INGREDIENT_LABELS[ing]}`).join(" + ")}
                </div>
                <button className="as-fulfill-btn"
                  disabled={!canFulfill(i)}
                  onClick={() => d({ type: "fulfillOrder", orderIndex: i })}>
                  Fulfill
                </button>
              </div>
            );
          })}
          <button className="as-end-turn" onClick={() => d({ type: "endTurn" })}>End Turn →</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="as-done">
          <div>All {TOTAL_ORDERS} orders complete!</div>
          <div>Final Coins: <strong>{state.coins}</strong></div>
          <div>{state.coins >= 200 ? "🏆 Master Alchemist!" : state.coins >= 120 ? "👍 Skilled Brewer!" : "⚗️ Keep practicing!"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="as-log">
          {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i} className="as-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
