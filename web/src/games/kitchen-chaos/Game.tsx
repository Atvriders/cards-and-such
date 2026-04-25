import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KitchenChaosState, KitchenChaosSettings, Ingredient } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const ING_EMOJI: Record<Ingredient, string> = {
  tomato: "🍅",
  cheese: "🧀",
  lettuce: "🥬",
  bread: "🍞",
  meat: "🥩",
};

const ALL_ING: Ingredient[] = ["tomato", "cheese", "lettuce", "bread", "meat"];

export function KitchenChaosGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<KitchenChaosState, KitchenChaosSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const tick = useCallback(() => {
    dispatch({ type: "tick" });
  }, [dispatch]);

  useEffect(() => {
    if (state.gameOver) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [state.gameOver, tick]);

  const activeOrders = state.orders.filter(o => !o.complete && !o.failed);
  const active = state.activeOrderId !== null
    ? state.orders.find(o => o.id === state.activeOrderId)
    : null;

  return (
    <div className="kc-game">
      <div className="kc-title">Kitchen Chaos 👨‍🍳</div>
      <div className="kc-hud">
        <span>Score: {state.score}</span>
        <span>✅ {state.completed}</span>
        <span>❌ {state.failed}</span>
        <span>⏱ {state.maxTick - state.tick}s</span>
      </div>

      <div className="kc-orders">
        {activeOrders.map(order => (
          <div
            key={order.id}
            className={`kc-order${state.activeOrderId === order.id ? " selected" : ""}${order.timeLeft < 5 ? " urgent" : ""}`}
            onClick={() => dispatch({ type: "select-order", id: order.id })}
          >
            <div className="kc-order-header">Order #{order.id} — {order.timeLeft}s</div>
            <div className="kc-recipe">
              {order.ingredients.map((ing, i) => (
                <span key={i} className={`kc-ing${order.assembled[i] === ing ? " done" : ""}`}>
                  {ING_EMOJI[ing]}
                </span>
              ))}
            </div>
            {order.assembled.length > 0 && (
              <div className="kc-assembled">
                Built: {order.assembled.map(i => ING_EMOJI[i]).join(" ")}
              </div>
            )}
          </div>
        ))}
      </div>

      {active && !active.complete && !active.failed && (
        <div className="kc-workbench">
          <div className="kc-workbench-title">Adding to Order #{active.id}</div>
          <div className="kc-ingredients">
            {ALL_ING.map(ing => (
              <button key={ing} className="kc-ing-btn" onClick={() => dispatch({ type: "add-ingredient", ingredient: ing })}>
                {ING_EMOJI[ing]} {ing}
              </button>
            ))}
          </div>
          <button className="kc-serve-btn" onClick={() => dispatch({ type: "serve" })}>
            Serve!
          </button>
        </div>
      )}

      {!active && !state.gameOver && (
        <div className="kc-hint">Click an order above to start assembling it</div>
      )}

      {state.gameOver && (
        <div className="kc-gameover">
          Time's up! Score: {terminal?.score}
          <div className="kc-sub">Completed: {state.completed} | Failed: {state.failed}</div>
        </div>
      )}
    </div>
  );
}
