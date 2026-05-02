import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCricketDartsState, DiceCricketDartsAction, DiceCricketDartsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceCricketDartsGame({ state, dispatch, onGameOver }: GameProps<DiceCricketDartsState, DiceCricketDartsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dicrda-wrap">
        <div className="dicrda-done">
          <h2>Round</h2>
          <div className="dicrda-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dicrda-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dicrda-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dicrda-wrap">
      <div className="dicrda-head">
        <span className="dicrda-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dicrda-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dicrda-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dicrda-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dicrda-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dicrda-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dicrda-log">{line}</div>)}
      </div>
      <div className="dicrda-actions">
        {state.phase === "rolling" && (
          <button className="dicrda-btn primary" data-testid="hint-target-dice-cricket-darts-roll" onClick={() => dispatch({ type: "roll" } as DiceCricketDartsAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dicrda-btn alt" data-testid="hint-target-dice-cricket-darts-next" onClick={() => dispatch({ type: "next" } as DiceCricketDartsAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
