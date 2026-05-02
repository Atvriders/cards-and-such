import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceKaisaState, DiceKaisaAction, DiceKaisaSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceKaisaGame({ state, dispatch, onGameOver }: GameProps<DiceKaisaState, DiceKaisaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dickai-wrap">
        <div className="dickai-done">
          <h2>Shot</h2>
          <div className="dickai-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dickai-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dickai-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dickai-wrap">
      <div className="dickai-head">
        <span className="dickai-round">Shot {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dickai-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dickai-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dickai-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dickai-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dickai-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dickai-log">{line}</div>)}
      </div>
      <div className="dickai-actions">
        {state.phase === "rolling" && (
          <button className="dickai-btn primary" data-testid="hint-target-dice-kaisa-roll" onClick={() => dispatch({ type: "roll" } as DiceKaisaAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dickai-btn alt" data-testid="hint-target-dice-kaisa-next" onClick={() => dispatch({ type: "next" } as DiceKaisaAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
