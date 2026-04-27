import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SixShootState, SixShootAction, SixShootSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";
export function SixShootGame({ state, dispatch, onGameOver }: GameProps<SixShootState, SixShootSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase==="done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><p>Sixes: {state.matches}</p><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.drawn} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts</div>
      <div className="cm-result">Find the sixes! Each 6 drawn earns 40 points.</div>
      {state.lastCard !== null && (
        <div className={`cm-card ${isRed(state.lastCard) ? "red" : "black"}`}>{cardName(state.lastCard)}</div>
      )}
      <div className="cm-row">
        {state.hand.slice(-8).map((c,i)=>(
          <div key={i} className={`cm-card small ${isRed(c)?"red":"black"}`}>{cardName(c)}</div>
        ))}
      </div>
      <button className="cm-btn" onClick={() => dispatch({ type:"draw" } as SixShootAction)}>Draw</button>
    </div>
  );
}
