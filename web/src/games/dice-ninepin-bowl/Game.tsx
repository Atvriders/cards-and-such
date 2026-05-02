import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceNinepinBowlState, DiceNinepinBowlAction, DiceNinepinBowlSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceNinepinBowlGame({ state, dispatch, onGameOver }: GameProps<DiceNinepinBowlState, DiceNinepinBowlSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dinibo-wrap">
        <div className="dinibo-done">
          <h2>Frame</h2>
          <div className="dinibo-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dinibo-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dinibo-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dinibo-wrap">
      <div className="dinibo-head">
        <span className="dinibo-round">Frame {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dinibo-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dinibo-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dinibo-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dinibo-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dinibo-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dinibo-log">{line}</div>)}
      </div>
      <div className="dinibo-actions">
        {state.phase === "rolling" && (
          <button className="dinibo-btn primary" data-testid="hint-target-dice-ninepin-bowl-roll" onClick={() => dispatch({ type: "roll" } as DiceNinepinBowlAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dinibo-btn alt" data-testid="hint-target-dice-ninepin-bowl-next" onClick={() => dispatch({ type: "next" } as DiceNinepinBowlAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
