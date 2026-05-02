import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TonkRState, TonkRAction, TonkRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function TonkRGame({ state, dispatch, onGameOver }: GameProps<TonkRState, TonkRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="tnkr-wrap"><div className="tnkr-done"><h2>Done!</h2><div className="tnkr-final">{state.score} pts</div></div></div>;
  return (
    <div className="tnkr-wrap">
      <div className="tnkr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="tnkr-score">{state.score} pts</div>
      <div className="tnkr-row">{state.hand.map((c, i) => <div key={i} className={`tnkr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-tonk-r-play" className="tnkr-btn" onClick={() => dispatch({ type: "score" } as TonkRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="tnkr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-tonk-r-next" className="tnkr-btn alt" onClick={() => dispatch({ type: "next" } as TonkRAction)}>Next</button>
      </>}
    </div>
  );
}
