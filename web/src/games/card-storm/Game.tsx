import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardStormState, CardStormAction, CardStormSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function CardStormGame({ state, dispatch, onGameOver }: GameProps<CardStormState, CardStormSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS}{state.storm ? " — STORM reshuffled!" : ""}</div>
      <div className="cm-score">{state.score} pts</div>
      <div className="cm-row">
        {state.hand.map((c, i) => <div key={i} className={`cm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
      </div>
      {state.phase === "playing" && <button data-testid="hint-target-card-storm-primary" className="cm-btn" onClick={() => dispatch({ type:"lock" } as CardStormAction)}>Lock Hand</button>}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">+{state.lastPts}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as CardStormAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
