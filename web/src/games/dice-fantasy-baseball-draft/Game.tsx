import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFantasyBaseballDraftState, DiceFantasyBaseballDraftAction, DiceFantasyBaseballDraftSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceFantasyBaseballDraftGame({ state, dispatch, onGameOver }: GameProps<DiceFantasyBaseballDraftState, DiceFantasyBaseballDraftSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="difabadr-wrap">
        <div className="difabadr-done">
          <h2>Pick</h2>
          <div className="difabadr-final">{Math.max(0, state.score)} pts</div>
          
          <div className="difabadr-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="difabadr-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="difabadr-wrap">
      <div className="difabadr-head">
        <span className="difabadr-round">Pick {state.round} / {TOTAL_ROUNDS}</span>
        <span className="difabadr-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="difabadr-dice-row">
          {state.dice.map((d, i) => <div key={i} className="difabadr-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="difabadr-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="difabadr-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="difabadr-log">{line}</div>)}
      </div>
      <div className="difabadr-actions">
        {state.phase === "rolling" && (
          <button className="difabadr-btn primary" onClick={() => dispatch({ type: "roll" } as DiceFantasyBaseballDraftAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="difabadr-btn alt" onClick={() => dispatch({ type: "next" } as DiceFantasyBaseballDraftAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
