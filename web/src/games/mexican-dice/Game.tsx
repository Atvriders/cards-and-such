import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MexicanDiceState, MexicanDiceAction, MexicanDiceSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function MexicanDiceGame({ state, dispatch, onGameOver }: GameProps<MexicanDiceState, MexicanDiceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.totalScore} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.totalScore} pts</div>
      {state.dice && (
        <div className="dm-row">
          <div className="dm-die">{state.dice[0]}</div>
          <div className="dm-die">{state.dice[1]}</div>
        </div>
      )}
      {state.phase === "rolling" && (
        <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as MexicanDiceAction)}>Roll Two</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">{state.lastTag}: +{state.lastPts}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as MexicanDiceAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
