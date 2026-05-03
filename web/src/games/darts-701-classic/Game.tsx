import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Darts701ClassicState, Darts701ClassicAction, Darts701ClassicSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function Darts701ClassicGame({ state, dispatch, onGameOver }: GameProps<Darts701ClassicState, Darts701ClassicSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="da70cl-wrap">
        <div className="da70cl-done">
          <h2>Throw</h2>
          <div className="da70cl-final">{Math.max(0, state.score)} pts</div>
          
          <div className="da70cl-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="da70cl-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="da70cl-wrap">
      <div className="da70cl-head">
        <span className="da70cl-round">Throw {state.round} / {TOTAL_ROUNDS}</span>
        <span className="da70cl-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="da70cl-dice-row">
          {state.dice.map((d, i) => <div key={i} className="da70cl-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="da70cl-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="da70cl-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="da70cl-log">{line}</div>)}
      </div>
      <div className="da70cl-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-darts-701-classic-action" className="da70cl-btn primary" onClick={() => dispatch({ type: "roll" } as Darts701ClassicAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="da70cl-btn alt" onClick={() => dispatch({ type: "next" } as Darts701ClassicAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
