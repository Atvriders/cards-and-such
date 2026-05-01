import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PenniesHeavenRState, PenniesHeavenRAction, PenniesHeavenRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function PenniesHeavenRGame({ state, dispatch, onGameOver }: GameProps<PenniesHeavenRState, PenniesHeavenRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="pnyr-wrap"><div className="pnyr-done"><h2>Done!</h2><div className="pnyr-final">{state.score} pts</div></div></div>;
  return (
    <div className="pnyr-wrap">
      <div className="pnyr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="pnyr-score">{state.score} pts</div>
      <div className="pnyr-row">{state.hand.map((c, i) => <div key={i} className={`pnyr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="pnyr-btn" onClick={() => dispatch({ type: "score" } as PenniesHeavenRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="pnyr-result">{state.result} — +{state.pts}</div>
        <button className="pnyr-btn alt" onClick={() => dispatch({ type: "next" } as PenniesHeavenRAction)}>Next</button>
      </>}
    </div>
  );
}
