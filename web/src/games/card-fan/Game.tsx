import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardFanState, CardFanAction, CardFanSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function CardFanGame({ state, dispatch, onGameOver }: GameProps<CardFanState, CardFanSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cm-score">{state.score} pts</div>
      <div className="cm-row">
        {state.hand.map((c,i)=>(
          <button key={i} disabled={state.phase!=="choose"} className={`cm-card ${isRed(c)?"red":"black"} pickable`} onClick={() => dispatch({ type:"pick", index:i } as CardFanAction)}>{cardName(c)}</button>
        ))}
      </div>
      {state.phase === "result" && (<><div className="cm-result">{state.lastWin ? "Top pick! +30" : "Not the highest"}</div><button data-testid="hint-target-card-fan-primary" className="cm-btn alt" onClick={() => dispatch({ type:"next" } as CardFanAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button></>)}
    </div>
  );
}
