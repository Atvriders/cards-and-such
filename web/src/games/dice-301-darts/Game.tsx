import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Dice301DartsState, Dice301DartsAction, Dice301DartsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function Dice301DartsGame({ state, dispatch, onGameOver }: GameProps<Dice301DartsState, Dice301DartsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="di30da-wrap">
        <div className="di30da-done">
          <h2>Throw</h2>
          <div className="di30da-final">{Math.max(0, state.score)} pts</div>
          
          <div className="di30da-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="di30da-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="di30da-wrap">
      <div className="di30da-head">
        <span className="di30da-round">Throw {state.round} / {TOTAL_ROUNDS}</span>
        <span className="di30da-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="di30da-dice-row">
          {state.dice.map((d, i) => <div key={i} className="di30da-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="di30da-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="di30da-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="di30da-log">{line}</div>)}
      </div>
      <div className="di30da-actions">
        {state.phase === "rolling" && (
          <button className="di30da-btn primary" onClick={() => dispatch({ type: "roll" } as Dice301DartsAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="di30da-btn alt" onClick={() => dispatch({ type: "next" } as Dice301DartsAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
