import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceMusicMiniState, DiceMusicMiniAction, DiceMusicMiniSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceMusicMiniGame({ state, dispatch, onGameOver }: GameProps<DiceMusicMiniState, DiceMusicMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dmm-wrap"><div className="dmm-done"><h2>Done!</h2><div className="dmm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dmm-wrap">
      <div className="dmm-info">Round {state.round + 1} / {TOTAL_ROUNDS}</div>
      <div className="dmm-score">{state.score} pts</div>
      {state.lastRoll > 0 && (
        <>
          <div className="dmm-die">{state.lastRoll}</div>
          <div className="dmm-result">{state.lastPts > 0 ? `+${state.lastPts}` : "Miss"}</div>
        </>
      )}
      {state.rolls.length > 0 && (
        <div className="dmm-row">
          {state.rolls.map((r, i) => <div key={i} className="dmm-mini">{r}</div>)}
        </div>
      )}
      <button data-testid="hint-target-dice-music-mini-roll" className="dmm-btn" onClick={() => dispatch({ type:"roll" } as DiceMusicMiniAction)}>Roll Die</button>
    </div>
  );
}
