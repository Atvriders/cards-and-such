import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTyphoonState, DiceTyphoonAction, DiceTyphoonSettings } from "./state.js";
import { isTerminal, ROUNDS } from "./state.js";
import "./Game.css";

export function DiceTyphoonGame({ state, dispatch, onGameOver }: GameProps<DiceTyphoonState, DiceTyphoonSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="ty-wrap">
        <div className="ty-done bounce-in">
          <h2>Storm Passes</h2>
          <div className="ty-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ty-wrap fade-in">
      <div className="ty-rain"></div>
      <div className="ty-banner">Round {state.round} / {ROUNDS} · Banked {state.score}</div>
      <div className="ty-pool">Pool: <strong>{state.pool}</strong></div>
      {state.rolls.length > 0 && (
        <div className="ty-row">
          {state.rolls.map((r, i) => <div key={i} className={`ty-die${state.busted ? " bust" : ""}`}>{r}</div>)}
        </div>
      )}
      <div className="ty-log">{state.log || "Roll for points or bank what you have. Double 1s wipe the pool."}</div>
      <div className="ty-actions">
        <button className="ty-btn roll" data-testid="hint-target-dice-typhoon-roll" onClick={() => dispatch({ type: "roll" } as DiceTyphoonAction)}>Roll Wave</button>
        <button className="ty-btn bank" disabled={state.pool <= 0} data-testid="hint-target-dice-typhoon-bank" onClick={() => dispatch({ type: "bank" } as DiceTyphoonAction)}>Bank ({state.pool})</button>
      </div>
    </div>
  );
}
