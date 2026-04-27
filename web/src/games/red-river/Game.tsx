import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RedRiverState, RedRiverAction, RedRiverSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";
export function RedRiverGame({ state, dispatch, onGameOver }: GameProps<RedRiverState, RedRiverSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div>Best streak: {state.bestStreak}</div><div className="cm-final">{state.score} pts</div></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.draw} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts (Streak: {state.streak})</div>
      {state.lastCard !== null && <div className={`cm-card ${isRed(state.lastCard) ? "red" : "black"}`}>{cardName(state.lastCard)}</div>}
      {state.phase === "drawing" && <button className="cm-btn" onClick={() => dispatch({ type:"draw" } as RedRiverAction)}>Draw</button>}
      {state.phase === "result" && <>
        <div className="cm-result">{state.streak > 0 ? `Red x${state.streak}!` : "Black — streak broken"}</div>
        <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as RedRiverAction)}>{state.draw >= TOTAL_DRAWS ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}
