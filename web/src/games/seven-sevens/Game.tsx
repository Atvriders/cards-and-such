import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SevenSevensState, SevenSevensAction, SevenSevensSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";
export function SevenSevensGame({ state, dispatch, onGameOver }: GameProps<SevenSevensState, SevenSevensSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase==="done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><p>Sevens: {state.matches}</p><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.drawn} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts</div>
      <div className="cm-result">Find the sevens! Each 7 drawn earns 50 points.</div>
      {state.lastCard !== null && (
        <div className={`cm-card ${isRed(state.lastCard) ? "red" : "black"}`}>{cardName(state.lastCard)}</div>
      )}
      <div className="cm-row">
        {state.hand.slice(-8).map((c,i)=>(
          <div key={i} className={`cm-card small ${isRed(c)?"red":"black"}`}>{cardName(c)}</div>
        ))}
      </div>
      <button data-testid="hint-target-seven-sevens-primary" className="cm-btn" onClick={() => dispatch({ type:"draw" } as SevenSevensAction)}>Draw</button>
    </div>
  );
}
