import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFlushMiniState, DiceFlushMiniAction, DiceFlushMiniSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceFlushMiniGame({ state, dispatch, onGameOver }: GameProps<DiceFlushMiniState, DiceFlushMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap dice-flush-mini-theme"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap dice-flush-mini-theme">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice && (
        <div className="dm-row">
          {state.dice.map((d, i) => <div key={i} className="dm-die">{d}</div>)}
        </div>
      )}
      {state.phase === "rolling" && (
        <button className="dm-btn" onClick={() => dispatch({ type: "roll" } as DiceFlushMiniAction)}>Roll 5 Dice</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">{state.lastBonus} +{state.lastPts}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type: "next" } as DiceFlushMiniAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
