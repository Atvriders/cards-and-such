import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceGrandPrixF1State, DiceGrandPrixF1Action, DiceGrandPrixF1Settings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceGrandPrixF1Game({ state, dispatch, onGameOver }: GameProps<DiceGrandPrixF1State, DiceGrandPrixF1Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="digrprf1-wrap">
        <div className="digrprf1-done">
          <h2>Lap</h2>
          <div className="digrprf1-final">{Math.max(0, state.score)} pts</div>
          
          <div className="digrprf1-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="digrprf1-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="digrprf1-wrap">
      <div className="digrprf1-head">
        <span className="digrprf1-round">Lap {state.round} / {TOTAL_ROUNDS}</span>
        <span className="digrprf1-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="digrprf1-dice-row">
          {state.dice.map((d, i) => <div key={i} className="digrprf1-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="digrprf1-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="digrprf1-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="digrprf1-log">{line}</div>)}
      </div>
      <div className="digrprf1-actions">
        {state.phase === "rolling" && (
          <button className="digrprf1-btn primary" data-testid="hint-target-dice-grand-prix-f1-roll" onClick={() => dispatch({ type: "roll" } as DiceGrandPrixF1Action)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="digrprf1-btn alt" data-testid="hint-target-dice-grand-prix-f1-next" onClick={() => dispatch({ type: "next" } as DiceGrandPrixF1Action)}>Next</button>
        )}
      </div>
    </div>
  );
}
