import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PigClassicState, PigClassicAction, PigClassicSettings } from "./state.js";
import { isTerminal, TARGET, MAX_TURNS } from "./state.js";
import "./Game.css";

export function PigClassicGame({ state, dispatch, onGameOver }: GameProps<PigClassicState, PigClassicSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.totalScore} pts</div><div>{state.totalScore >= TARGET ? "Reached the target!" : "Out of turns."}</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Turn {state.turn} / {MAX_TURNS} — Target: {TARGET}</div>
      <div className="dm-score">Banked: {state.totalScore} | Turn total: {state.turnTotal}</div>
      <div className="dm-row">
        <div className={`dm-die ${state.lastWasOne ? "danger" : ""}`}>{state.lastRoll || "?"}</div>
      </div>
      {state.lastWasOne && <div className="dm-result">Rolled a 1! Turn total wiped.</div>}
      <div className="dm-row">
        <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as PigClassicAction)}>Roll</button>
        <button className="dm-btn alt" disabled={state.turnTotal === 0} onClick={() => dispatch({ type:"bank" } as PigClassicAction)}>Bank {state.turnTotal}</button>
      </div>
    </div>
  );
}
