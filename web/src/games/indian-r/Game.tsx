import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IndianRState, IndianRAction, IndianRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function IndianRGame({ state, dispatch, onGameOver }: GameProps<IndianRState, IndianRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="indr-wrap"><div className="indr-done bounce-in"><h2>Done!</h2><div className="indr-final">{state.score} pts</div></div></div>;
  return (
    <div className="indr-wrap fade-in">
      <div className="indr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="indr-score pulse">{state.score} pts</div>
      <div className="indr-row">{state.hand.map((c, i) => <div key={i} className={`indr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-indian-r-play" className="indr-btn" onClick={() => dispatch({ type: "score" } as IndianRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="indr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-indian-r-next" className="indr-btn alt" onClick={() => dispatch({ type: "next" } as IndianRAction)}>Next</button>
      </>}
    </div>
  );
}
