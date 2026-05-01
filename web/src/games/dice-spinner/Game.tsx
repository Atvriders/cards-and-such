import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSpinnerState, DiceSpinnerAction, DiceSpinnerSettings } from "./state.js";
import { isTerminal, TOTAL_ROLLS } from "./state.js";
import "./Game.css";

export function DiceSpinnerGame({ state, dispatch, onGameOver }: GameProps<DiceSpinnerState, DiceSpinnerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dspn-wrap dspn-theme"><div className="dspn-done"><h2>Done!</h2><div className="dspn-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dspn-wrap dspn-theme">
      <div className="dspn-info">Roll {state.rollNo} / {TOTAL_ROLLS}</div>
      <div className="dspn-score">{state.score} pts</div>
      {state.lastFace !== null && <div className="dspn-die">{state.lastFace}</div>}
      {state.phase === "betting" && (
        <div className="dspn-row">
          <button className="dspn-btn" onClick={() => dispatch({ type:"bet", choice:"low" } as DiceSpinnerAction)}>Low (1-3)</button>
          <button className="dspn-btn" onClick={() => dispatch({ type:"bet", choice:"even" } as DiceSpinnerAction)}>Even</button>
          <button className="dspn-btn" onClick={() => dispatch({ type:"bet", choice:"high" } as DiceSpinnerAction)}>High (4-6)</button>
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className="dspn-result">{state.lastWin ? "Win! +5" : "Miss"} (Bet: {state.lastBet})</div>
          <button className="dspn-btn alt" onClick={() => dispatch({ type:"next" } as DiceSpinnerAction)}>Next</button>
        </>
      )}
    </div>
  );
}
