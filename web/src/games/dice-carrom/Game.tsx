import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCarromState, DiceCarromAction, DiceCarromSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceCarromGame({ state, dispatch, onGameOver }: GameProps<DiceCarromState, DiceCarromSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="diccar-wrap">
        <div className="diccar-done">
          <h2>Round</h2>
          <div className="diccar-final">{Math.max(0, state.score)} pts</div>
          
          <div className="diccar-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="diccar-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="diccar-wrap">
      <div className="diccar-head">
        <span className="diccar-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="diccar-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="diccar-dice-row">
          {state.dice.map((d, i) => <div key={i} className="diccar-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="diccar-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="diccar-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="diccar-log">{line}</div>)}
      </div>
      <div className="diccar-actions">
        {state.phase === "rolling" && (
          <button className="diccar-btn primary" data-testid="hint-target-dice-carrom-roll" onClick={() => dispatch({ type: "roll" } as DiceCarromAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="diccar-btn alt" data-testid="hint-target-dice-carrom-next" onClick={() => dispatch({ type: "next" } as DiceCarromAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
