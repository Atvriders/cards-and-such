import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AceAlleyState, AceAlleyAction, AceAlleySettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";
export function AceAlleyGame({ state, dispatch, onGameOver }: GameProps<AceAlleyState, AceAlleySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div>Aces: {state.aces}</div><div className="cm-final">{state.score} pts</div></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.draw} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts (Aces: {state.aces})</div>
      {state.lastCard !== null && <div className={`cm-card ${isRed(state.lastCard) ? "red" : "black"}`}>{cardName(state.lastCard)}</div>}
      {state.phase === "drawing" && <button className="cm-btn" onClick={() => dispatch({ type:"draw" } as AceAlleyAction)}>Draw</button>}
      {state.phase === "result" && <>
        <div className="cm-result">{state.isAce ? "ACE! +100" : "no ace"}</div>
        <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as AceAlleyAction)}>{state.draw >= TOTAL_DRAWS ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}
