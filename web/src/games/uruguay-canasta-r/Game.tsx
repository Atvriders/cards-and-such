import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { UruguayCanastaRState, UruguayCanastaRAction, UruguayCanastaRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function UruguayCanastaRGame({ state, dispatch, onGameOver }: GameProps<UruguayCanastaRState, UruguayCanastaRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="urur-wrap"><div className="urur-done"><h2>Done!</h2><div className="urur-final">{state.score} pts</div></div></div>;
  return (
    <div className="urur-wrap">
      <div className="urur-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="urur-score">{state.score} pts</div>
      <div className="urur-row">{state.hand.map((c, i) => <div key={i} className={`urur-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-uruguay-canasta-r-play" className="urur-btn" onClick={() => dispatch({ type: "score" } as UruguayCanastaRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="urur-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-uruguay-canasta-r-next" className="urur-btn alt" onClick={() => dispatch({ type: "next" } as UruguayCanastaRAction)}>Next</button>
      </>}
    </div>
  );
}
