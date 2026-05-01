import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HandFootRState, HandFootRAction, HandFootRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function HandFootRGame({ state, dispatch, onGameOver }: GameProps<HandFootRState, HandFootRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="hfr-wrap"><div className="hfr-done"><h2>Done!</h2><div className="hfr-final">{state.score} pts</div></div></div>;
  return (
    <div className="hfr-wrap">
      <div className="hfr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="hfr-score">{state.score} pts</div>
      <div className="hfr-row">{state.hand.map((c, i) => <div key={i} className={`hfr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="hfr-btn" onClick={() => dispatch({ type: "score" } as HandFootRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="hfr-result">{state.result} — +{state.pts}</div>
        <button className="hfr-btn alt" onClick={() => dispatch({ type: "next" } as HandFootRAction)}>Next</button>
      </>}
    </div>
  );
}
