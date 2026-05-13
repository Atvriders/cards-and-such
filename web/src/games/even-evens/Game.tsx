import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EvenEvensState, EvenEvensAction, EvenEvensSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";

export function EvenEvensGame({ state, dispatch, onGameOver }: GameProps<EvenEvensState, EvenEvensSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done bounce-in"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap fade-in">
      <div className="cm-info">Draw {state.drawNumber} / {TOTAL_DRAWS}</div>
      <div className="cm-score pulse">{state.score} pts</div>
      {state.pair && (
        <div className="cm-row">
          <div className={`cm-card ${isRed(state.pair[0]) ? "red" : "black"}`}>{cardName(state.pair[0])}</div>
          <div className={`cm-card ${isRed(state.pair[1]) ? "red" : "black"}`}>{cardName(state.pair[1])}</div>
        </div>
      )}
      {state.phase === "ready" && (
        <button data-testid="hint-target-even-evens-primary" className="cm-btn" onClick={() => dispatch({ type:"draw" } as EvenEvensAction)}>Draw 2</button>
      )}
      {state.phase === "revealed" && (
        <>
          <div className="cm-result">{state.lastWin ? "Both even! +20" : "Not both even — 0"}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as EvenEvensAction)}>Next</button>
        </>
      )}
    </div>
  );
}
