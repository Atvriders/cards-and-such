import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceRallymanDirtState, DiceRallymanDirtAction, DiceRallymanDirtSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceRallymanDirtGame({ state, dispatch, onGameOver }: GameProps<DiceRallymanDirtState, DiceRallymanDirtSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="diradi-wrap">
        <div className="diradi-done">
          <h2>Lap</h2>
          <div className="diradi-final">{Math.max(0, state.score)} pts</div>
          
          <div className="diradi-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="diradi-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="diradi-wrap">
      <div className="diradi-head">
        <span className="diradi-round">Lap {state.round} / {TOTAL_ROUNDS}</span>
        <span className="diradi-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="diradi-dice-row">
          {state.dice.map((d, i) => <div key={i} className="diradi-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="diradi-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="diradi-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="diradi-log">{line}</div>)}
      </div>
      <div className="diradi-actions">
        {state.phase === "rolling" && (
          <button className="diradi-btn primary" onClick={() => dispatch({ type: "roll" } as DiceRallymanDirtAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="diradi-btn alt" onClick={() => dispatch({ type: "next" } as DiceRallymanDirtAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
