import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePickupState, DicePickupAction, DicePickupSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DicePickupGame({ state, dispatch, onGameOver }: GameProps<DicePickupState, DicePickupSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dpck-wrap dpck-theme"><div className="dpck-done"><h2>Done!</h2><div className="dpck-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dpck-wrap dpck-theme">
      <div className="dpck-info">Round {state.round} / {TOTAL_ROUNDS} — Target: <strong>{state.target}</strong></div>
      <div className="dpck-score">{state.score} pts</div>
      <div className="dpck-grid">
        {state.dice.map((d, i) => (
          <button key={i} className={`dp-die ${state.picked[i] ? "picked" : ""}`} disabled={state.phase !== "picking"} onClick={() => dispatch({ type:"pick", index:i } as DicePickupAction)}>
            {d}
          </button>
        ))}
      </div>
      {state.phase === "picking" && <button className="dpck-btn" onClick={() => dispatch({ type:"submit" } as DicePickupAction)}>Submit Picks</button>}
      {state.phase === "result" && (
        <>
          <div className="dpck-result">+{state.lastPts}</div>
          <button className="dpck-btn alt" onClick={() => dispatch({ type:"next" } as DicePickupAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
