import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SevenStreakState, SevenStreakAction, SevenStreakSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";
export function SevenStreakGame({ state, dispatch, onGameOver }: GameProps<SevenStreakState, SevenStreakSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div>Sevens: {state.sevens}</div><div className="cm-final">{state.score} pts</div></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.draw} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts (Sevens: {state.sevens})</div>
      {state.lastCard !== null && <div className={`cm-card ${isRed(state.lastCard) ? "red" : "black"}`}>{cardName(state.lastCard)}</div>}
      {state.phase === "drawing" && <button className="cm-btn" onClick={() => dispatch({ type:"draw" } as SevenStreakAction)}>Draw</button>}
      {state.phase === "result" && <>
        <div className="cm-result">{state.hit ? "Lucky 7! +50" : "no seven"}</div>
        <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as SevenStreakAction)}>{state.draw >= TOTAL_DRAWS ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}
