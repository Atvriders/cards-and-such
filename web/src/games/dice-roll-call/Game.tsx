import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceRollCallState, DiceRollCallAction, DiceRollCallSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
const PIPS = ["⚀","⚁","⚂","⚃","⚄","⚅"];
export function DiceRollCallGame({ state, dispatch, onGameOver }: GameProps<DiceRollCallState, DiceRollCallSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="drc-wrap"><div className="drc-done"><h2>Done!</h2><div className="drc-final">{t?.score} pts</div></div></div>;
  }
  return (
    <div className="drc-wrap">
      <div className="drc-header">Round {state.round}/{TOTAL_ROUNDS} <span className="drc-score">{state.score}</span></div>
      {state.phase === "call" ? (
        <>
          <div className="drc-prompt">Call your roll!</div>
          <div className="drc-keys">
            {[1,2,3,4,5,6].map(v => (
              <button key={v} className="drc-key" onClick={() => dispatch({ type:"call", value:v } as DiceRollCallAction)}>{PIPS[v - 1]}</button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="drc-result">
            <span>You called {PIPS[(state.call ?? 1) - 1]}</span>
            <span>Rolled: {PIPS[(state.die ?? 1) - 1]}</span>
          </div>
          <button className="drc-btn next" onClick={() => dispatch({ type:"next" } as DiceRollCallAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
