import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PursuitState, PursuitAction, PursuitSettings } from "./state.js";
import { isTerminal, PATH_LEN } from "./state.js";
import "./Game.css";

export function PursuitMiniGame({ state, dispatch, onGameOver }: GameProps<PursuitState, PursuitSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="pm-wrap">
      <div className="pm-head">Pos {state.pos}/{PATH_LEN} — Wisdom <b>{state.wisdom}</b></div>
      <div className="pm-track">
        <div className="pm-fill" style={{ width: `${(state.pos / PATH_LEN) * 100}%` }} />
      </div>
      {state.phase === "rolling" && <button data-testid="hint-target-pursuit-mini-primary" className="pm-btn" onClick={() => dispatch({ type: "roll" } as PursuitAction)}>Roll</button>}
      {state.phase === "asking" && state.current && (
        <div className="pm-q">
          <div className="pm-text">{state.current.q}</div>
          <div className="pm-buttons">
            <button onClick={() => dispatch({ type: "answer", value: true } as PursuitAction)}>True</button>
            <button onClick={() => dispatch({ type: "answer", value: false } as PursuitAction)}>False</button>
          </div>
        </div>
      )}
      {state.phase === "answered" && (
        <div className={`pm-result ${state.lastCorrect ? "pm-good" : "pm-bad"}`}>
          {state.lastCorrect ? "Correct! +10 wisdom" : "Not quite."}
          <button onClick={() => dispatch({ type: "next" } as PursuitAction)}>Next</button>
        </div>
      )}
      {state.phase === "done" && <div className="pm-done">Final wisdom: {state.wisdom}</div>}
    </div>
  );
}
