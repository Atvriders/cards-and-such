import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BuracoRState, BuracoRAction, BuracoRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function BuracoRGame({ state, dispatch, onGameOver }: GameProps<BuracoRState, BuracoRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="burr-wrap"><div className="burr-done"><h2>Done!</h2><div className="burr-final">{state.score} pts</div></div></div>;
  return (
    <div className="burr-wrap">
      <div className="burr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="burr-score">{state.score} pts</div>
      <div className="burr-row">{state.hand.map((c, i) => <div key={i} className={`burr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="burr-btn" onClick={() => dispatch({ type: "score" } as BuracoRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="burr-result">{state.result} — +{state.pts}</div>
        <button className="burr-btn alt" onClick={() => dispatch({ type: "next" } as BuracoRAction)}>Next</button>
      </>}
    </div>
  );
}
