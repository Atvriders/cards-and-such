import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceStreakState, DiceStreakAction, DiceStreakSettings } from "./state.js";
import { isTerminal, MAX_ROLLS } from "./state.js";
import "./Game.css";

export function DiceStreakGame({ state, dispatch, onGameOver }: GameProps<DiceStreakState, DiceStreakSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dstk-wrap dstk-theme"><div className="dstk-done"><h2>Done!</h2><div className="dstk-final">{state.score} pts</div><div>Best streak: {state.bestStreak}</div></div></div>;
  }
  return (
    <div className="dstk-wrap dstk-theme">
      <div className="dstk-info">Rolls: {state.rolls} / {MAX_ROLLS}</div>
      <div className="dstk-score">{state.score} pts</div>
      <div className="dstk-info">Streak: {state.streak} (best {state.bestStreak})</div>
      {state.current !== 0 && <div className="dstk-die">{state.current}</div>}
      <div className="dstk-history">
        {state.history.slice(-15).map((d, i) => <span key={i} className="dstk-mini">{d}</span>)}
      </div>
      <div className="dstk-row">
        <button className="dstk-btn" onClick={() => dispatch({ type:"roll" } as DiceStreakAction)}>Roll</button>
        <button className="dstk-btn alt" onClick={() => dispatch({ type:"stop" } as DiceStreakAction)}>Stop & Score</button>
      </div>
    </div>
  );
}
