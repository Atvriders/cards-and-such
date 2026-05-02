import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuartetMatchState, QuartetMatchAction, QuartetMatchSettings } from "./state.js";
import { isTerminal, cardName, isRed } from "./state.js";
import "./Game.css";

export function QuartetMatchGame({ state, dispatch, onGameOver }: GameProps<QuartetMatchState, QuartetMatchSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {state.maxRounds}</div>
      <div className="cm-score">{state.score} pts</div>
      <div className="cm-info">Pick 4 of the same rank to form a quartet</div>
      <div className="cm-row">
        {state.hand.map((c, i) => {
          const sel = state.selected.includes(i);
          return (
            <button key={i}
              className={`cm-card ${isRed(c) ? "red" : "black"}`}
              style={{ outline: sel ? "3px solid #3498db" : "none", cursor: state.phase === "selecting" ? "pointer" : "default" }}
              disabled={state.phase !== "selecting"}
              onClick={() => dispatch({ type:"toggle", idx:i } as QuartetMatchAction)}>{cardName(c)}</button>
          );
        })}
      </div>
      {state.phase === "selecting" && (
        <button data-testid="hint-target-quartet-match-primary" className="cm-btn" disabled={state.selected.length !== 4} onClick={() => dispatch({ type:"submit" } as QuartetMatchAction)}>Submit</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">{state.lastMessage}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as QuartetMatchAction)}>{state.round >= state.maxRounds ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
