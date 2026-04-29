import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { JackpotsDrawState, JackpotsDrawAction, JackpotsDrawSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function JackpotsDrawGame({ state, dispatch, onGameOver }: GameProps<JackpotsDrawState, JackpotsDrawSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.hand.length > 0 && <div className="dm-row">{state.hand.map((c, i) => <div key={i} className={`dm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>}
      {state.phase === "deal" && <button className="dm-btn" onClick={() => dispatch({ type: "deal" } as JackpotsDrawAction)}>Deal</button>}
      {state.phase === "scored" && <>
        <div className="dm-result">{state.result} — +{state.pts}</div>
        <button className="dm-btn alt" onClick={() => dispatch({ type: "next" } as JackpotsDrawAction)}>Next</button>
      </>}
    </div>
  );
}
