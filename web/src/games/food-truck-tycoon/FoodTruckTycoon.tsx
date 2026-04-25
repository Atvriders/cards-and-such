import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FoodTruckTycoonState, FoodTruckTycoonSettings, FoodItem } from "./state.js";
import { isTerminal } from "./state.js";
import "./FoodTruckTycoon.css";

const FOOD_EMOJI: Record<FoodItem, string> = {
  burger: "🍔",
  taco: "🌮",
  pizza: "🍕",
  salad: "🥗",
  soda: "🥤",
};

export function FoodTruckTycoon({ state, dispatch, onGameOver }: GameProps<FoodTruckTycoonState, FoodTruckTycoonSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="food-truck-tycoon">
      <div className="ftt-header">🚚 Food Truck Tycoon</div>

      <div className="ftt-hud">
        <span>Day {state.day}/{state.totalDays}</span>
        <span>Cash: ${state.money}</span>
        <span>Total Profit: ${state.totalProfit}</span>
        {state.phase === "report" && <span>Today: +${state.profit}</span>}
      </div>

      {state.phase === "prep" && (
        <>
          <table className="ftt-menu">
            <thead>
              <tr><th>Item</th><th>Cost</th><th>Price</th><th>Stock</th><th>Restock</th></tr>
            </thead>
            <tbody>
              {state.menu.map(m => (
                <tr key={m.item}>
                  <td>{FOOD_EMOJI[m.item]} {m.item}</td>
                  <td>${m.cost}</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={m.price}
                      onChange={e => dispatch({ type: "setPrice", item: m.item, price: parseInt(e.target.value, 10) || m.price })}
                    />
                  </td>
                  <td>{m.stock}</td>
                  <td>
                    <button onClick={() => dispatch({ type: "restock", item: m.item, qty: 5 })}>+5 (${m.cost * 5})</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ftt-controls">
            <button onClick={() => dispatch({ type: "openForBusiness" })}>Open for Business 🍽️</button>
          </div>
        </>
      )}

      {state.phase === "report" && !state.gameOver && (
        <div className="ftt-controls">
          <button onClick={() => dispatch({ type: "nextDay" })}>Next Day ▶</button>
        </div>
      )}

      <div className="ftt-log">
        {state.log.map((line, i) => <p key={i}>{line}</p>)}
      </div>

      {state.gameOver && (
        <>
          <div className="ftt-game-over">
            Final Score! Total Profit: ${state.totalProfit}
          </div>
          <button onClick={() => dispatch({ type: "restart" })}>Play Again</button>
        </>
      )}
    </div>
  );
}
