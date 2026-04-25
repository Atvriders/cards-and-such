import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IceCreamState, IceCreamAction, Flavor } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const FLAVORS: Flavor[] = ["vanilla", "chocolate", "strawberry", "mint", "caramel"];
const FLAVOR_EMOJI: Record<Flavor, string> = {
  vanilla: "🍦", chocolate: "🍫", strawberry: "🍓", mint: "🌿", caramel: "🍮",
};
const WEATHER_EMOJI: Record<string, string> = {
  sunny: "☀️ Sunny", hot: "🔥 Hot", cloudy: "☁️ Cloudy", rainy: "🌧️ Rainy",
};
const MAX_PRICE: Record<Flavor, number> = {
  vanilla: 6, chocolate: 7, strawberry: 7, mint: 8, caramel: 9,
};

export function IceCreamStand({
  state,
  dispatch,
  onGameOver,
}: GameProps<IceCreamState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: IceCreamAction) => dispatch(a);

  return (
    <div className="ics-wrap">
      <div className="ics-header">
        <span className="ics-title">Ice Cream Stand</span>
        <span className="ics-day">Day {state.day}/{state.totalDays}</span>
        <span className="ics-cash">${state.cash}</span>
      </div>

      <div className="ics-weather">
        Today: {WEATHER_EMOJI[state.weather] ?? state.weather} | Tomorrow: {WEATHER_EMOJI[state.nextWeather] ?? state.nextWeather}
      </div>

      {state.phase === "plan" && (
        <>
          <div className="ics-flavors">
            {FLAVORS.map(flavor => (
              <div key={flavor} className="ics-flavor-row">
                <div className="ics-flavor-title">{FLAVOR_EMOJI[flavor]} {flavor.charAt(0).toUpperCase() + flavor.slice(1)}</div>
                <div className="ics-controls">
                  <span>Scoops:</span>
                  <input type="range" min={0} max={40} step={1} value={state.scoops[flavor]}
                    onChange={e => d({ type: "setScoops", flavor, value: +e.target.value })} />
                  <strong>{state.scoops[flavor]}</strong>
                </div>
                <div className="ics-controls">
                  <span>Price:</span>
                  <input type="range" min={1} max={MAX_PRICE[flavor]} step={1} value={state.price[flavor]}
                    onChange={e => d({ type: "setPrice", flavor, value: +e.target.value })} />
                  <strong>${state.price[flavor]}</strong>
                </div>
              </div>
            ))}
          </div>
          <div className="ics-topping-row">
            <span>Toppings Lv{state.toppingsLevel}/3 (+10% demand each)</span>
            <button className="ics-btn-sm"
              disabled={state.toppingsLevel >= 3 || state.cash < 40}
              onClick={() => d({ type: "buyToppings" })}>
              Upgrade ($40)
            </button>
          </div>
          <button className="ics-btn" onClick={() => d({ type: "openStand" })}>Open Stand!</button>
        </>
      )}

      {state.phase === "results" && (
        <div className="ics-results">
          {FLAVORS.map(flavor => (
            <div key={flavor} className="ics-result-row">
              <span>{FLAVOR_EMOJI[flavor]} {flavor}</span>
              <span>Sold {state.sold[flavor]} → ${state.sold[flavor] * state.price[flavor]}</span>
            </div>
          ))}
          <div className={`ics-profit ${state.lastProfit >= 0 ? "pos" : "neg"}`}>
            Profit: {state.lastProfit >= 0 ? "+" : ""}${state.lastProfit}
          </div>
          <button className="ics-btn" onClick={() => d({ type: "nextDay" })}>
            {state.day >= state.totalDays ? "Close Stand" : "Next Day →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="ics-done">
          <div>Final Cash: ${state.cash}</div>
          <div>{state.cash >= 600 ? "🏆 Ice Cream King!" : state.cash >= 300 ? "Nice job!" : "Keep scooping!"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="ics-log">
          {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  );
}
