import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSkittlesState, DiceSkittlesAction, DiceSkittlesSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceSkittlesGame({ state, dispatch, onGameOver }: GameProps<DiceSkittlesState, DiceSkittlesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dicski-wrap">
        <div className="dicski-done">
          <h2>Frame</h2>
          <div className="dicski-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dicski-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dicski-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dicski-wrap">
      <div className="dicski-head">
        <span className="dicski-round">Frame {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dicski-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dicski-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dicski-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dicski-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dicski-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dicski-log">{line}</div>)}
      </div>
      <div className="dicski-actions">
        {state.phase === "rolling" && (
          <button className="dicski-btn primary" data-testid="hint-target-dice-skittles-roll" onClick={() => dispatch({ type: "roll" } as DiceSkittlesAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dicski-btn alt" data-testid="hint-target-dice-skittles-next" onClick={() => dispatch({ type: "next" } as DiceSkittlesAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
