import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceRussianPyramidState, DiceRussianPyramidAction, DiceRussianPyramidSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceRussianPyramidGame({ state, dispatch, onGameOver }: GameProps<DiceRussianPyramidState, DiceRussianPyramidSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dirupy-wrap">
        <div className="dirupy-done">
          <h2>Shot</h2>
          <div className="dirupy-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dirupy-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dirupy-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dirupy-wrap">
      <div className="dirupy-head">
        <span className="dirupy-round">Shot {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dirupy-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dirupy-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dirupy-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dirupy-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dirupy-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dirupy-log">{line}</div>)}
      </div>
      <div className="dirupy-actions">
        {state.phase === "rolling" && (
          <button className="dirupy-btn primary" data-testid="hint-target-dice-russian-pyramid-roll" onClick={() => dispatch({ type: "roll" } as DiceRussianPyramidAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dirupy-btn alt" data-testid="hint-target-dice-russian-pyramid-next" onClick={() => dispatch({ type: "next" } as DiceRussianPyramidAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
