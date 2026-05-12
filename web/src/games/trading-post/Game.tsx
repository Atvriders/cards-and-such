import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TradingPostState, TradingPostAction, Good } from "./state.js";
import { isTerminal, GOODS, GOOD_LABELS, TOTAL_TURNS } from "./state.js";
import "./Game.css";

const GOOD_EMOJI: Record<Good, string> = {
  silk: "🧣", spice: "🌶️", iron: "⚙️", grain: "🌾", gems: "💎",
};

export function TradingPost({ state, dispatch, onGameOver }: GameProps<TradingPostState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: TradingPostAction) => dispatch(a);

  return (
    <div className="tp-wrap">
      <div className="tp-header">
        <span className="tp-title">🏪 Trading Post</span>
        <span className="tp-turn">Turn {state.turn}/{TOTAL_TURNS}</span>
        <span className="tp-gold">Gold: {state.gold}</span>
        <span className="tp-phase">{state.phase === "buy" ? "BUY Phase" : state.phase === "sell" ? "SELL Phase" : ""}</span>
      </div>

      {state.eventMessage && <div className="tp-event">{state.eventMessage}</div>}

      {state.phase !== "done" && (
        <div className="tp-goods">
          {GOODS.map(g => (
            <div key={g} className="tp-good-row">
              <span className="tp-good-name">{GOOD_EMOJI[g]} {GOOD_LABELS[g]}</span>
              <span className="tp-price">{state.prices[g]}g</span>
              <span className="tp-inv">Inv: {state.inventory[g]}</span>
              {state.phase === "buy" && (
                <div className="tp-btns">
                  {[1, 3, 5].map(qty => (
                    <button key={qty} className="tp-btn tp-buy" title="Buy"
                      disabled={state.gold < state.prices[g] * qty}
                      onClick={() => d({ type: "buy", good: g, qty })}>+{qty}</button>
                  ))}
                </div>
              )}
              {state.phase === "sell" && (
                <div className="tp-btns">
                  {[1, 3, 5].map(qty => (
                    <button key={qty} className="tp-btn tp-sell" title="Sell"
                      disabled={state.inventory[g] < qty}
                      onClick={() => d({ type: "sell", good: g, qty })}>-{qty}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {state.phase === "buy" && (
        <button className="tp-advance" onClick={() => d({ type: "endPhase" })}>Done Buying → Sell Phase</button>
      )}
      {state.phase === "sell" && (
        <button className="tp-advance" onClick={() => d({ type: "endPhase" })}>
          {state.turn >= TOTAL_TURNS ? "End Game" : "End Turn →"}
        </button>
      )}

      {state.phase === "done" && (
        <div className="tp-done">
          <div>Final Gold: <strong>{state.gold}</strong></div>
          <div className="tp-score-label">
            {state.gold >= 600 ? "🏆 Master Trader!" : state.gold >= 350 ? "👍 Profitable Run!" : "📉 Keep Practicing!"}
          </div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="tp-log">
          {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i} className="tp-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
