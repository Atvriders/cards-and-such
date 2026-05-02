import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTenpinBowlState, DiceTenpinBowlAction, DiceTenpinBowlSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceTenpinBowlGame({ state, dispatch, onGameOver }: GameProps<DiceTenpinBowlState, DiceTenpinBowlSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="ditebo-wrap">
        <div className="ditebo-done">
          <h2>Frame</h2>
          <div className="ditebo-final">{Math.max(0, state.score)} pts</div>
          
          <div className="ditebo-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="ditebo-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="ditebo-wrap">
      <div className="ditebo-head">
        <span className="ditebo-round">Frame {state.round} / {TOTAL_ROUNDS}</span>
        <span className="ditebo-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="ditebo-dice-row">
          {state.dice.map((d, i) => <div key={i} className="ditebo-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="ditebo-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="ditebo-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="ditebo-log">{line}</div>)}
      </div>
      <div className="ditebo-actions">
        {state.phase === "rolling" && (
          <button className="ditebo-btn primary" data-testid="hint-target-dice-tenpin-bowl-roll" onClick={() => dispatch({ type: "roll" } as DiceTenpinBowlAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="ditebo-btn alt" data-testid="hint-target-dice-tenpin-bowl-next" onClick={() => dispatch({ type: "next" } as DiceTenpinBowlAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
