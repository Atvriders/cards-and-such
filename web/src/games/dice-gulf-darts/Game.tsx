import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceGulfDartsState, DiceGulfDartsAction, DiceGulfDartsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceGulfDartsGame({ state, dispatch, onGameOver }: GameProps<DiceGulfDartsState, DiceGulfDartsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="diguda-wrap">
        <div className="diguda-done">
          <h2>Hole</h2>
          <div className="diguda-final">{Math.max(0, state.score)} pts</div>
          
          <div className="diguda-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="diguda-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="diguda-wrap">
      <div className="diguda-head">
        <span className="diguda-round">Hole {state.round} / {TOTAL_ROUNDS}</span>
        <span className="diguda-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="diguda-dice-row">
          {state.dice.map((d, i) => <div key={i} className="diguda-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="diguda-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="diguda-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="diguda-log">{line}</div>)}
      </div>
      <div className="diguda-actions">
        {state.phase === "rolling" && (
          <button className="diguda-btn primary" data-testid="hint-target-dice-gulf-darts-roll" onClick={() => dispatch({ type: "roll" } as DiceGulfDartsAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="diguda-btn alt" data-testid="hint-target-dice-gulf-darts-next" onClick={() => dispatch({ type: "next" } as DiceGulfDartsAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
