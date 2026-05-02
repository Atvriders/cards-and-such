import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceReplayBaseballDetailState, DiceReplayBaseballDetailAction, DiceReplayBaseballDetailSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceReplayBaseballDetailGame({ state, dispatch, onGameOver }: GameProps<DiceReplayBaseballDetailState, DiceReplayBaseballDetailSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="direbade-wrap">
        <div className="direbade-done">
          <h2>Inning</h2>
          <div className="direbade-final">{Math.max(0, state.score)} pts</div>
          
          <div className="direbade-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="direbade-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="direbade-wrap">
      <div className="direbade-head">
        <span className="direbade-round">Inning {state.round} / {TOTAL_ROUNDS}</span>
        <span className="direbade-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="direbade-dice-row">
          {state.dice.map((d, i) => <div key={i} className="direbade-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="direbade-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="direbade-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="direbade-log">{line}</div>)}
      </div>
      <div className="direbade-actions">
        {state.phase === "rolling" && (
          <button className="direbade-btn primary" data-testid="hint-target-dice-replay-baseball-detail-roll" onClick={() => dispatch({ type: "roll" } as DiceReplayBaseballDetailAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="direbade-btn alt" data-testid="hint-target-dice-replay-baseball-detail-next" onClick={() => dispatch({ type: "next" } as DiceReplayBaseballDetailAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
