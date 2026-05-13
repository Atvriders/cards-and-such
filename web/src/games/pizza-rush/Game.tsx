import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PizzaRushState, PizzaRushSettings, Topping } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const TOPPING_EMOJI: Record<Topping, string> = {
  sauce: "🍅",
  cheese: "🧀",
  pepperoni: "🥩",
  mushroom: "🍄",
  olive: "🫒",
};

export function PizzaRushGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<PizzaRushState, PizzaRushSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.over) return;
    const id = setInterval(() => dispatch({ type: "tick" }), 800);
    return () => clearInterval(id);
  }, [state.over, dispatch]);

  const activeOrder = state.orders.find(o => !o.completed && !o.failed);
  const toppings: Topping[] = ["sauce", "cheese", "pepperoni", "mushroom", "olive"];

  return (
    <div className="pr-game fade-in">
      <div className="pr-title">Pizza Rush!</div>
      <div className="pr-stats">
        <span>Score: <b>{state.score}</b></span>
        <span>Time: {state.maxTicks - state.tick}s</span>
        <span>Done: {state.ordersCompleted}</span>
        <span>Failed: {state.ordersFailed}</span>
      </div>

      {activeOrder && (
        <div className="pr-order">
          <div className="pr-order-title">Order #{activeOrder.id}</div>
          <div className="pr-order-toppings">
            {activeOrder.toppings.map((t, i) => (
              <span key={i} className="pr-topping-tag">{TOPPING_EMOJI[t]} {t}</span>
            ))}
          </div>
          <div className="pr-timer-bar">
            <div
              className="pr-timer-fill"
              style={{ width: `${(activeOrder.timeLeft / activeOrder.timeLimit) * 100}%` }}
            />
          </div>
        </div>
      )}

      {!activeOrder && !state.over && (
        <div className="pr-order pr-no-order">Waiting for next order...</div>
      )}

      <div className="pr-log">{state.log}</div>

      {!state.over && (
        <>
          <div className="pr-current">
            <span className="pr-section">Your Pizza:</span>
            <span className="pr-pizza-contents">
              {state.currentPizza.length === 0
                ? <span className="pr-empty">empty</span>
                : state.currentPizza.map((t, i) => (
                  <span key={i} className="pr-topping-tag">{TOPPING_EMOJI[t]} {t}</span>
                ))
              }
            </span>
          </div>
          <div className="pr-topping-btns">
            {toppings.map(t => (
              <button data-testid="hint-target-pizza-rush-action" key={t} className="pr-top-btn"
                onClick={() => dispatch({ type: "add-topping", topping: t })}>
                {TOPPING_EMOJI[t]}
              </button>
            ))}
          </div>
          <div className="pr-action-btns">
            <button className="pr-submit-btn" onClick={() => dispatch({ type: "submit" })}>Submit</button>
            <button className="pr-clear-btn" onClick={() => dispatch({ type: "clear" })}>Clear</button>
          </div>
        </>
      )}

      {state.over && (
        <div className="pr-result">
          Game Over! Final Score: <b>{Math.max(0, state.score)}</b>
        </div>
      )}
    </div>
  );
}
