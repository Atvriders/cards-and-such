import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FlushFinderState, FlushFinderAction, FlushFinderSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";

export function FlushFinderGame({ state, dispatch, onGameOver }: GameProps<FlushFinderState, FlushFinderSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.draw} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.hand.length > 0 && (
        <div className="cm-row">
          {state.hand.map((c, i) => <div key={i} className={`cm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
        </div>
      )}
      {state.phase === "dealing" && (
        <button data-testid="hint-target-flush-finder-primary" className="cm-btn" onClick={() => dispatch({ type:"deal" } as FlushFinderAction)}>Draw 5</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">{state.straightFlush ? "Straight flush! +250" : state.hadFlush ? "Flush! +200" : "No flush — 0"}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as FlushFinderAction)}>{state.draw >= TOTAL_DRAWS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
