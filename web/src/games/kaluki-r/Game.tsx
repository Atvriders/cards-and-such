import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KalukiRState, KalukiRAction, KalukiRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function KalukiRGame({ state, dispatch, onGameOver }: GameProps<KalukiRState, KalukiRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="kalr-wrap"><div className="kalr-done"><h2>Done!</h2><div className="kalr-final">{state.score} pts</div></div></div>;
  return (
    <div className="kalr-wrap">
      <div className="kalr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="kalr-score">{state.score} pts</div>
      <div className="kalr-row">{state.hand.map((c, i) => <div key={i} className={`kalr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="kalr-btn" onClick={() => dispatch({ type: "score" } as KalukiRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="kalr-result">{state.result} — +{state.pts}</div>
        <button className="kalr-btn alt" onClick={() => dispatch({ type: "next" } as KalukiRAction)}>Next</button>
      </>}
    </div>
  );
}
