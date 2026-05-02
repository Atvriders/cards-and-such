import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceShanghaiDartsState, DiceShanghaiDartsAction, DiceShanghaiDartsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceShanghaiDartsGame({ state, dispatch, onGameOver }: GameProps<DiceShanghaiDartsState, DiceShanghaiDartsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dishda-wrap">
        <div className="dishda-done">
          <h2>Round</h2>
          <div className="dishda-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dishda-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dishda-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dishda-wrap">
      <div className="dishda-head">
        <span className="dishda-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dishda-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dishda-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dishda-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dishda-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dishda-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dishda-log">{line}</div>)}
      </div>
      <div className="dishda-actions">
        {state.phase === "rolling" && (
          <button className="dishda-btn primary" data-testid="hint-target-dice-shanghai-darts-roll" onClick={() => dispatch({ type: "roll" } as DiceShanghaiDartsAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dishda-btn alt" data-testid="hint-target-dice-shanghai-darts-next" onClick={() => dispatch({ type: "next" } as DiceShanghaiDartsAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
