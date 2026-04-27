import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceStreakState, DiceStreakAction, DiceStreakSettings } from "./state.js";
import { isTerminal, MAX_ROLLS } from "./state.js";
import "./Game.css";

export function DiceStreakGame({ state, dispatch, onGameOver }: GameProps<DiceStreakState, DiceStreakSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-wrap"><div className="ds-done"><h2>Done!</h2><div className="ds-final">{state.score} pts</div><div>Best streak: {state.bestStreak}</div></div></div>;
  }
  return (
    <div className="ds-wrap">
      <div className="ds-info">Rolls: {state.rolls} / {MAX_ROLLS}</div>
      <div className="ds-score">{state.score} pts</div>
      <div className="ds-info">Streak: {state.streak} (best {state.bestStreak})</div>
      {state.current !== 0 && <div className="ds-die">{state.current}</div>}
      <div className="ds-history">
        {state.history.slice(-15).map((d, i) => <span key={i} className="ds-mini">{d}</span>)}
      </div>
      <div className="ds-row">
        <button className="ds-btn" onClick={() => dispatch({ type:"roll" } as DiceStreakAction)}>Roll</button>
        <button className="ds-btn alt" onClick={() => dispatch({ type:"stop" } as DiceStreakAction)}>Stop & Score</button>
      </div>
    </div>
  );
}
