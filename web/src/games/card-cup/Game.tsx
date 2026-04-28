import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardCupState, CardCupAction, CardCupSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function CardCupGame({ state, dispatch, onGameOver }: GameProps<CardCupState, CardCupSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.card !== null && <div className={`cm-card ${isRed(state.card)?"red":"black"}`}>{cardName(state.card)}</div>}
      {state.phase === "choose" && (<div className="cm-row"><button className="cm-btn" onClick={() => dispatch({ type:"pick", cup:"low" } as CardCupAction)}>Low Cup</button><button className="cm-btn" onClick={() => dispatch({ type:"pick", cup:"mid" } as CardCupAction)}>Mid Cup</button><button className="cm-btn" onClick={() => dispatch({ type:"pick", cup:"high" } as CardCupAction)}>High Cup</button></div>)}
      {state.phase === "result" && (<><div className="cm-result">{state.lastWin ? "Right cup! +20" : "Wrong cup"}</div><button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as CardCupAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button></>)}
    </div>
  );
}
