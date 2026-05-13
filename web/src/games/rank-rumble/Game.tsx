import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RankRumbleState, RankRumbleAction, RankRumbleSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function RankRumbleGame({ state, dispatch, onGameOver }: GameProps<RankRumbleState, RankRumbleSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done bounce-in"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap fade-in">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cm-score pulse">{state.score} pts</div>
      {state.hand.length > 0 && (
        <div className="cm-row">
          {state.hand.map((c, i) => <div key={i} className={`cm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
        </div>
      )}
      {state.phase === "dealing" && (
        <button data-testid="hint-target-rank-rumble-primary" className="cm-btn" onClick={() => dispatch({ type:"deal" } as RankRumbleAction)}>Deal 4</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">+{state.lastPts}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as RankRumbleAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
