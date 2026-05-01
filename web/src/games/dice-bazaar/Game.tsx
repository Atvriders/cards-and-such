import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBazaarState, DiceBazaarAction, DiceBazaarSettings } from "./state.js";
import { isTerminal, GOODS, TURNS } from "./state.js";
import "./Game.css";

export function DiceBazaarGame({ state, dispatch, onGameOver }: GameProps<DiceBazaarState, DiceBazaarSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="bz-wrap">
        <div className="bz-done">
          <h2>Bazaar Closes</h2>
          <div className="bz-final">{state.score} pts</div>
          <div className="bz-log">{state.log}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bz-wrap">
      <div className="bz-banner">Day {state.turn} / {TURNS} · Gold {state.gold} · Score {state.score}</div>
      <div className="bz-stalls">
        {GOODS.map(g => (
          <div key={g} className="bz-stall">
            <div className="bz-good">{g}</div>
            <div className="bz-price">{state.prices[g]}g</div>
            <div className="bz-stock">stock: {state.inventory[g]}</div>
            <div className="bz-actions">
              <button className="bz-btn buy" disabled={state.gold < state.prices[g]} onClick={() => dispatch({ type: "buy", good: g } as DiceBazaarAction)}>Buy</button>
              <button className="bz-btn sell" disabled={state.inventory[g] <= 0} onClick={() => dispatch({ type: "sell", good: g } as DiceBazaarAction)}>Sell</button>
            </div>
          </div>
        ))}
      </div>
      <div className="bz-log">{state.log || "Buy low, sell high. Prices change daily."}</div>
      <button className="bz-btn next" onClick={() => dispatch({ type: "next" } as DiceBazaarAction)}>Next Day →</button>
    </div>
  );
}
