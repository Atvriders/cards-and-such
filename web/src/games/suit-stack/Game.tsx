import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SuitStackState, SuitStackAction, SuitStackSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";

export function SuitStackGame({ state, dispatch, onGameOver }: GameProps<SuitStackState, SuitStackSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="cm-wrap">
        <div className="cm-row">{state.drawn.map((c,i) => <div key={i} className={`cm-card ${isRed(c)?"red":"black"}`}>{cardName(c)}</div>)}</div>
        <div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div>
      </div>
    );
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.drawn.length} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts &mdash; streak {state.streak}</div>
      <div className="cm-row">
        {state.drawn.map((c,i) => <div key={i} className={`cm-card ${isRed(c)?"red":"black"}`}>{cardName(c)}</div>)}
      </div>
      <button data-testid="hint-target-suit-stack-primary" className="cm-btn" onClick={() => dispatch({ type:"draw" } as SuitStackAction)}>Draw</button>
    </div>
  );
}
