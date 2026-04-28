import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StartupState, StartupAction, StartupSettings } from "./state.js";
import { isTerminal, score, TARGET_VALUATION, MAX_TURNS } from "./state.js";
import "./Game.css";

export function StartupLifeMiniGame({ state, dispatch, onGameOver }: GameProps<StartupState, StartupSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="sl-wrap">
      <div className="sl-stats">
        <div>Turn <b>{state.turn}/{MAX_TURNS}</b></div>
        <div>Cash <b>${state.cash.toLocaleString()}</b></div>
        <div>Hires <b>{state.hires}</b></div>
        <div>Product <b>{state.product}/10</b></div>
      </div>
      <div className="sl-val">
        Valuation: <b>${state.valuation.toLocaleString()}</b> / ${TARGET_VALUATION.toLocaleString()}
        <div className="sl-bar"><div className="sl-fill" style={{ width: `${Math.min(100, (state.valuation / TARGET_VALUATION) * 100)}%` }} /></div>
      </div>
      {state.phase === "rolling" && <button className="sl-btn" onClick={() => dispatch({ type: "roll" } as StartupAction)}>Roll Dice</button>}
      {state.phase === "resolved" && (
        <div className="sl-event">
          {state.lastEvent}
          <button onClick={() => dispatch({ type: "next" } as StartupAction)}>Next</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="sl-done">
          {state.valuation >= TARGET_VALUATION ? <h3>IPO! 🎉</h3> : <h3>Game Over</h3>}
          <div>Score: {score(state)}</div>
        </div>
      )}
    </div>
  );
}
