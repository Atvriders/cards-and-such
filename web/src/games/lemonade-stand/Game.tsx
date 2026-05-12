import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LemonadeState } from "./state.js";
import { isTerminal, TOTAL_DAYS } from "./state.js";
import type { LemonadeAction } from "./state.js";
import "./Game.css";

const WEATHER_EMOJI: Record<string, string> = {
  sunny: "☀️",
  cloudy: "⛅",
  hot: "🔥",
  rainy: "🌧️",
};
const WEATHER_HINT: Record<string, string> = {
  sunny: "Good selling weather!",
  cloudy: "Moderate demand.",
  hot: "Great demand — make lots!",
  rainy: "Low demand — be careful.",
};

function fmt(cents: number): string {
  const neg = cents < 0;
  const abs = Math.abs(cents);
  return `${neg ? "-" : ""}$${(abs / 100).toFixed(2)}`;
}

export function LemonadeStand({
  state,
  dispatch,
  onGameOver,
}: GameProps<LemonadeState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: LemonadeAction) => dispatch(a);

  return (
    <div className="lemon-wrap fade-in">
      <div className="lemon-header">
        <span className="lemon-title">🍋 Lemonade Stand</span>
        <span className="lemon-day">Day {state.day}/{TOTAL_DAYS}</span>
        <span className="lemon-money">{fmt(state.money)}</span>
      </div>

      {state.phase !== "done" && (
        <div className="lemon-weather">
          {WEATHER_EMOJI[state.weather]} <strong>{state.weather.toUpperCase()}</strong> — {WEATHER_HINT[state.weather]}
        </div>
      )}

      {state.phase === "planning" && (
        <div className="lemon-plan">
          <label>
            Price per cup: <strong>¢{state.price}</strong>
            <input type="range" min={10} max={100} step={5} value={state.price}
              onChange={e => d({ type: "setPrice", value: +e.target.value })} />
          </label>
          <label>
            Cups to make: <strong>{state.cups}</strong>
            <input type="range" min={1} max={50} step={1} value={state.cups}
              onChange={e => d({ type: "setCups", value: +e.target.value })} />
          </label>
          <label>
            Ad budget: <strong>¢{state.adBudget}</strong>
            <input type="range" min={0} max={50} step={5} value={state.adBudget}
              onChange={e => d({ type: "setAd", value: +e.target.value })} />
          </label>
          <div className="lemon-cost-preview">
            Cost: ¢{state.cups * 4 + state.adBudget} (¢4/cup + ads)
          </div>
          <button className="lemon-btn" onClick={() => d({ type: "sell" })}>
            Open Stand!
          </button>
        </div>
      )}

      {state.phase === "results" && (
        <div className="lemon-results">
          <div className="lemon-result-row">Cups made: {state.cups}</div>
          <div className="lemon-result-row">Cups sold: <strong>{state.lastSold}</strong></div>
          <div className="lemon-result-row">Revenue: ¢{state.lastRevenue}</div>
          <div className="lemon-result-row">Cost: ¢{state.lastCost}</div>
          <div className={`lemon-result-row profit ${state.lastProfit >= 0 ? "pos" : "neg"}`}>
            Profit: {state.lastProfit >= 0 ? "+" : ""}¢{state.lastProfit}
          </div>
          <button className="lemon-btn" onClick={() => d({ type: "nextDay" })}>
            {state.day >= TOTAL_DAYS ? "See Final Score" : "Next Day →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="lemon-done bounce-in">
          <div className="lemon-final">Final Balance: <strong>{fmt(state.money)}</strong></div>
          <div className="lemon-score">{state.money >= 400 ? "🏆 Great profit!" : state.money >= 200 ? "👍 Broke even!" : "📉 Lost money"}</div>
        </div>
      )}

      {state.dayLog.length > 0 && (
        <div className="lemon-log">
          {[...state.dayLog].reverse().map((l, i) => <div key={i} className="lemon-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
