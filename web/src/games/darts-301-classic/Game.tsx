import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Darts301ClassicState, Darts301ClassicAction, Darts301ClassicSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function Darts301ClassicGame({ state, dispatch, onGameOver }: GameProps<Darts301ClassicState, Darts301ClassicSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="da30cl-wrap">
        <div className="da30cl-done">
          <h2>Throw</h2>
          <div className="da30cl-final">{Math.max(0, state.score)} pts</div>
          
          <div className="da30cl-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="da30cl-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="da30cl-wrap">
      <div className="da30cl-head">
        <span className="da30cl-round">Throw {state.round} / {TOTAL_ROUNDS}</span>
        <span className="da30cl-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="da30cl-dice-row">
          {state.dice.map((d, i) => <div key={i} className="da30cl-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="da30cl-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="da30cl-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="da30cl-log">{line}</div>)}
      </div>
      <div className="da30cl-actions">
        {state.phase === "rolling" && (
          <button className="da30cl-btn primary" onClick={() => dispatch({ type: "roll" } as Darts301ClassicAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="da30cl-btn alt" onClick={() => dispatch({ type: "next" } as Darts301ClassicAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
