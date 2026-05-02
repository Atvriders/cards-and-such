import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TripleTroubleState, TripleTroubleAction, TripleTroubleSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";
export function TripleTroubleGame({ state, dispatch, onGameOver }: GameProps<TripleTroubleState, TripleTroubleSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div>Triples found: {state.triples}</div><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.draw} / {TOTAL_DRAWS} — Triples: {state.triples}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.hand.length > 0 && (
        <div className="cm-row">
          {state.hand.slice(-8).map((c, i) => <div key={i} className={`cm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
        </div>
      )}
      {state.phase === "drawing" && (
        <button data-testid="hint-target-triple-trouble-primary" className="cm-btn" onClick={() => dispatch({ type:"draw" } as TripleTroubleAction)}>Draw a card</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">{state.lastTripleRank !== null ? `Triple! +30` : `No triple yet.`}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as TripleTroubleAction)}>Continue</button>
        </>
      )}
    </div>
  );
}
