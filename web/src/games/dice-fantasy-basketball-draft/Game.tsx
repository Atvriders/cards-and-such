import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFantasyBasketballDraftState, DiceFantasyBasketballDraftAction, DiceFantasyBasketballDraftSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceFantasyBasketballDraftGame({ state, dispatch, onGameOver }: GameProps<DiceFantasyBasketballDraftState, DiceFantasyBasketballDraftSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="difbsk-wrap">
        <div className="difbsk-done">
          <h2>Pick</h2>
          <div className="difbsk-final">{Math.max(0, state.score)} pts</div>
          
          <div className="difbsk-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="difbsk-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="difbsk-wrap">
      <div className="difbsk-head">
        <span className="difbsk-round">Pick {state.round} / {TOTAL_ROUNDS}</span>
        <span className="difbsk-score pulse">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="difbsk-dice-row">
          {state.dice.map((d, i) => <div key={i} className="difbsk-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="difbsk-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="difbsk-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="difbsk-log">{line}</div>)}
      </div>
      <div className="difbsk-actions">
        {state.phase === "rolling" && (
          <button className="difbsk-btn primary" data-testid="hint-target-dice-fantasy-basketball-draft-roll" onClick={() => dispatch({ type: "roll" } as DiceFantasyBasketballDraftAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="difbsk-btn alt" data-testid="hint-target-dice-fantasy-basketball-draft-next" onClick={() => dispatch({ type: "next" } as DiceFantasyBasketballDraftAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
