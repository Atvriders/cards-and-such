import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBoxingKoState, DiceBoxingKoAction, DiceBoxingKoSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceBoxingKoGame({ state, dispatch, onGameOver }: GameProps<DiceBoxingKoState, DiceBoxingKoSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="diboko-wrap">
        <div className="diboko-done">
          <h2>Round</h2>
          <div className="diboko-final">{Math.max(0, state.score)} pts</div>
          
          <div className="diboko-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="diboko-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="diboko-wrap">
      <div className="diboko-head">
        <span className="diboko-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="diboko-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="diboko-dice-row">
          {state.dice.map((d, i) => <div key={i} className="diboko-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="diboko-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="diboko-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="diboko-log">{line}</div>)}
      </div>
      <div className="diboko-actions">
        {state.phase === "rolling" && (
          <button className="diboko-btn primary" data-testid="hint-target-dice-boxing-ko-roll" onClick={() => dispatch({ type: "roll" } as DiceBoxingKoAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="diboko-btn alt" data-testid="hint-target-dice-boxing-ko-next" onClick={() => dispatch({ type: "next" } as DiceBoxingKoAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
