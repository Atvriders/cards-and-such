import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceApbaBasketballState, DiceApbaBasketballAction, DiceApbaBasketballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceApbaBasketballGame({ state, dispatch, onGameOver }: GameProps<DiceApbaBasketballState, DiceApbaBasketballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="diapba-wrap">
        <div className="diapba-done bounce-in">
          <h2>Quarter</h2>
          <div className="diapba-final">{Math.max(0, state.score)} pts</div>
          
          <div className="diapba-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="diapba-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="diapba-wrap fade-in">
      <div className="diapba-head">
        <span className="diapba-round">Quarter {state.round} / {TOTAL_ROUNDS}</span>
        <span className="diapba-score pulse">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="diapba-dice-row">
          {state.dice.map((d, i) => <div key={i} className="diapba-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="diapba-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="diapba-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="diapba-log">{line}</div>)}
      </div>
      <div className="diapba-actions">
        {state.phase === "rolling" && (
          <button className="diapba-btn primary" data-testid="hint-target-dice-apba-basketball-roll" onClick={() => dispatch({ type: "roll" } as DiceApbaBasketballAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="diapba-btn alt" data-testid="hint-target-dice-apba-basketball-next" onClick={() => dispatch({ type: "next" } as DiceApbaBasketballAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
