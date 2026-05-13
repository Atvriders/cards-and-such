import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PoolStraight141State, PoolStraight141Action, PoolStraight141Settings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function PoolStraight141Game({ state, dispatch, onGameOver }: GameProps<PoolStraight141State, PoolStraight141Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="post14-wrap">
        <div className="post14-done bounce-in">
          <h2>Shot</h2>
          <div className="post14-final">{Math.max(0, state.score)} pts</div>
          
          <div className="post14-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="post14-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="post14-wrap fade-in">
      <div className="post14-head">
        <span className="post14-round">Shot {state.round} / {TOTAL_ROUNDS}</span>
        <span className="post14-score pulse">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="post14-dice-row">
          {state.dice.map((d, i) => <div key={i} className="post14-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="post14-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="post14-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="post14-log">{line}</div>)}
      </div>
      <div className="post14-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-pool-straight-141-action" className="post14-btn primary" onClick={() => dispatch({ type: "roll" } as PoolStraight141Action)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="post14-btn alt" onClick={() => dispatch({ type: "next" } as PoolStraight141Action)}>Next</button>
        )}
      </div>
    </div>
  );
}
