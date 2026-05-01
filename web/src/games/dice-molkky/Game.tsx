import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceMolkkyState, DiceMolkkyAction, DiceMolkkySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceMolkkyGame({ state, dispatch, onGameOver }: GameProps<DiceMolkkyState, DiceMolkkySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dicmol-wrap">
        <div className="dicmol-done">
          <h2>Throw</h2>
          <div className="dicmol-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dicmol-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dicmol-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dicmol-wrap">
      <div className="dicmol-head">
        <span className="dicmol-round">Throw {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dicmol-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dicmol-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dicmol-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dicmol-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dicmol-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dicmol-log">{line}</div>)}
      </div>
      <div className="dicmol-actions">
        {state.phase === "rolling" && (
          <button className="dicmol-btn primary" onClick={() => dispatch({ type: "roll" } as DiceMolkkyAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dicmol-btn alt" onClick={() => dispatch({ type: "next" } as DiceMolkkyAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
