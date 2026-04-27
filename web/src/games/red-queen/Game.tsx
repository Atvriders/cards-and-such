import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RedQueenState, RedQueenAction, RedQueenSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";

export function RedQueenGame({ state, dispatch, onGameOver }: GameProps<RedQueenState, RedQueenSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div>Hits: {state.hits} / {TOTAL_DRAWS}</div><div className="cm-final">{state.score} pts</div></div></div>;
  }
  const last = state.drawn[state.drawn.length - 1];
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.draws} / {TOTAL_DRAWS} — Hits: {state.hits}</div>
      <div className="cm-score">{state.score} pts</div>
      {last !== undefined && (
        <div className="cm-row">
          <div className={`cm-card ${isRed(last) ? "red" : "black"}`}>{cardName(last)}</div>
        </div>
      )}
      <button className="cm-btn" onClick={() => dispatch({ type:"draw" } as RedQueenAction)}>Draw</button>
    </div>
  );
}
