import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceKillerDartsState, DiceKillerDartsAction, DiceKillerDartsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceKillerDartsGame({ state, dispatch, onGameOver }: GameProps<DiceKillerDartsState, DiceKillerDartsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dikida-wrap">
        <div className="dikida-done">
          <h2>Throw</h2>
          <div className="dikida-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dikida-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dikida-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dikida-wrap">
      <div className="dikida-head">
        <span className="dikida-round">Throw {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dikida-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dikida-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dikida-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dikida-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dikida-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dikida-log">{line}</div>)}
      </div>
      <div className="dikida-actions">
        {state.phase === "rolling" && (
          <button className="dikida-btn primary" data-testid="hint-target-dice-killer-darts-roll" onClick={() => dispatch({ type: "roll" } as DiceKillerDartsAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dikida-btn alt" data-testid="hint-target-dice-killer-darts-next" onClick={() => dispatch({ type: "next" } as DiceKillerDartsAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
