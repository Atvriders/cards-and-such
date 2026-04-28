import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceOrchestraState, DiceOrchestraAction, DiceOrchestraSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, OPTIONS } from "./state.js";
import "./Game.css";

export function DiceOrchestraGame({ state, dispatch, onGameOver }: GameProps<DiceOrchestraState, DiceOrchestraSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice && (
        <div className="dm-row">
          <div className="dm-die">{state.dice[0]}</div>
          <div className="dm-die">{state.dice[1]}</div>
        </div>
      )}
      {state.phase === "predict" && (
        <div className="dm-row">
          {OPTIONS.map(o => (
            <button key={o.label} className="dm-btn" onClick={() => dispatch({ type:"predict", choice:o.label } as DiceOrchestraAction)}>{o.label} (+{o.points})</button>
          ))}
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className="dm-result">{state.choice}: {state.lastWin ? `Won +${state.lastPts}` : "Missed (+0)"}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceOrchestraAction)}>Next</button>
        </>
      )}
    </div>
  );
}
