import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ThreeThirteenRState, ThreeThirteenRAction, ThreeThirteenRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function ThreeThirteenRGame({ state, dispatch, onGameOver }: GameProps<ThreeThirteenRState, ThreeThirteenRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="thtr-wrap"><div className="thtr-done"><h2>Done!</h2><div className="thtr-final">{state.score} pts</div></div></div>;
  return (
    <div className="thtr-wrap">
      <div className="thtr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="thtr-score">{state.score} pts</div>
      <div className="thtr-row">{state.hand.map((c, i) => <div key={i} className={`thtr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="thtr-btn" onClick={() => dispatch({ type: "score" } as ThreeThirteenRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="thtr-result">{state.result} — +{state.pts}</div>
        <button className="thtr-btn alt" onClick={() => dispatch({ type: "next" } as ThreeThirteenRAction)}>Next</button>
      </>}
    </div>
  );
}
