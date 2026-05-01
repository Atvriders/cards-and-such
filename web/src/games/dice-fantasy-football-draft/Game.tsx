import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFantasyFootballDraftState, DiceFantasyFootballDraftAction, DiceFantasyFootballDraftSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceFantasyFootballDraftGame({ state, dispatch, onGameOver }: GameProps<DiceFantasyFootballDraftState, DiceFantasyFootballDraftSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="difafodr-wrap">
        <div className="difafodr-done">
          <h2>Pick</h2>
          <div className="difafodr-final">{Math.max(0, state.score)} pts</div>
          
          <div className="difafodr-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="difafodr-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="difafodr-wrap">
      <div className="difafodr-head">
        <span className="difafodr-round">Pick {state.round} / {TOTAL_ROUNDS}</span>
        <span className="difafodr-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="difafodr-dice-row">
          {state.dice.map((d, i) => <div key={i} className="difafodr-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="difafodr-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="difafodr-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="difafodr-log">{line}</div>)}
      </div>
      <div className="difafodr-actions">
        {state.phase === "rolling" && (
          <button className="difafodr-btn primary" onClick={() => dispatch({ type: "roll" } as DiceFantasyFootballDraftAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="difafodr-btn alt" onClick={() => dispatch({ type: "next" } as DiceFantasyFootballDraftAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
