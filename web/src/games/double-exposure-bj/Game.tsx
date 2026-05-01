import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DoubleExposureBjState, DoubleExposureBjAction, DoubleExposureBjSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function DoubleExposureBjGame({ state, dispatch, onGameOver }: GameProps<DoubleExposureBjState, DoubleExposureBjSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dx-bj-wrap"><div className="dx-bj-done"><h2>Done!</h2><div className="dx-bj-final">{state.score} pts</div></div></div>;
  return (
    <div className="dx-bj-wrap">
      <div className="dx-bj-info">Round {state.round} / {TOTAL_ROUNDS} — Total: {state.total}</div>
      <div className="dx-bj-score">{state.score} pts</div>
      <div className="dx-bj-row">{state.hand.map((c, i) => <div key={i} className={`dx-bj-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <div className="dx-bj-row">
        <button className="dx-bj-btn" onClick={() => dispatch({ type: "hit" } as DoubleExposureBjAction)}>Hit</button>
        <button className="dx-bj-btn alt" onClick={() => dispatch({ type: "stand" } as DoubleExposureBjAction)}>Stand</button>
      </div>}
      {state.phase === "scored" && <>
        <div className="dx-bj-result">{state.result} — +{state.pts}</div>
        <button className="dx-bj-btn alt" onClick={() => dispatch({ type: "next" } as DoubleExposureBjAction)}>Next</button>
      </>}
    </div>
  );
}
