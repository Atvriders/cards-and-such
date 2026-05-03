import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTradeRouteState, DiceTradeRouteAction, DiceTradeRouteSettings } from "./state.js";
import { isTerminal, STOPS } from "./state.js";
import "./Game.css";

export function DiceTradeRouteGame({ state, dispatch, onGameOver }: GameProps<DiceTradeRouteState, DiceTradeRouteSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="tr-wrap">
        <div className="tr-done">
          <h2>Trade Concluded</h2>
          <div className="tr-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  const price = state.prices[state.stop] ?? 0;

  return (
    <div className="tr-wrap">
      <div className="tr-banner">Stop {state.stop + 1} / {STOPS} · Goods {state.goods} · Score {state.score}</div>
      <div className="tr-cities">
        {state.prices.map((p, i) => (
          <div key={i} className={`tr-city${i === state.stop ? " here" : ""}${i < state.stop ? " past" : ""}`}>
            <div className="tr-city-name">City {i + 1}</div>
            <div className="tr-city-price">{p}g</div>
          </div>
        ))}
      </div>
      {state.rolls && (
        <div className="tr-row">
          <div className="tr-die">{state.rolls[0]}</div>
          <div className="tr-die">{state.rolls[1]}</div>
        </div>
      )}
      <div className="tr-log">{state.log || `Sell at ${price}g per unit. Travel risks bandits.`}</div>
      {state.phase === "trade" && (
        <div className="tr-actions">
          {[0, 1, 2, 3].map(n => (
            <button key={n} className="tr-btn" disabled={n > state.goods} onClick={() => dispatch({ type: "sell", amount: n } as DiceTradeRouteAction)}>{n === 0 ? "Hold" : "Sell " + n}</button>
          ))}
          <button className="tr-btn alt" disabled={state.goods === 0} onClick={() => dispatch({ type: "sell", amount: state.goods } as DiceTradeRouteAction)}>Sell All ({state.goods})</button>
        </div>
      )}
      {state.phase === "result" && (
        <button data-testid="hint-target-dice-trade-route-primary" className="tr-btn next" onClick={() => dispatch({ type: "next" } as DiceTradeRouteAction)}>Travel On</button>
      )}
    </div>
  );
}
