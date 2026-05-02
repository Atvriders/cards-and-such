import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceThunderPitState, DiceThunderPitAction, DiceThunderPitSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceThunderPitGame({ state, dispatch, onGameOver }: GameProps<DiceThunderPitState, DiceThunderPitSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dithpi-wrap">
        <div className="dithpi-done">
          <h2>Lap</h2>
          <div className="dithpi-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dithpi-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dithpi-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dithpi-wrap">
      <div className="dithpi-head">
        <span className="dithpi-round">Lap {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dithpi-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dithpi-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dithpi-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dithpi-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dithpi-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dithpi-log">{line}</div>)}
      </div>
      <div className="dithpi-actions">
        {state.phase === "rolling" && (
          <button className="dithpi-btn primary" data-testid="hint-target-dice-thunder-pit-roll" onClick={() => dispatch({ type: "roll" } as DiceThunderPitAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dithpi-btn alt" data-testid="hint-target-dice-thunder-pit-next" onClick={() => dispatch({ type: "next" } as DiceThunderPitAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
